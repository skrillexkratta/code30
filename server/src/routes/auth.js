const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const crypto  = require("crypto");
const { v4: uuid } = require("uuid");
const db      = require("../db");
const { signAccess, signRefresh, verifyRefresh, requireAuth, REFRESH_TTL_MS } = require("../middleware/auth");

// ── POST /auth/register ──────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!email || !password || !name)
    return res.status(400).json({ error: "Email, lösenord och namn krävs" });
  if (password.length < 8)
    return res.status(400).json({ error: "Lösenordet måste vara minst 8 tecken" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Ogiltig e-postadress" });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: "Email är redan registrerad" });

  const hash   = await bcrypt.hash(password, 12);
  const userId = uuid();

  db.prepare("INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)")
    .run(userId, email.toLowerCase(), name.trim(), hash);

  const { accessToken, refreshToken } = issueTokens(userId, email, name, "user");

  res.status(201).json({
    user: { id: userId, email: email.toLowerCase(), name: name.trim(), role: "user" },
    accessToken,
    refreshToken,
  });
});

// ── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "Email och lösenord krävs" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: "Fel email eller lösenord" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Fel email eller lösenord" });

  const { accessToken, refreshToken } = issueTokens(user.id, user.email, user.name, user.role);

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  });
});

// ── POST /auth/refresh ───────────────────────────────────────────────────────
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) return res.status(400).json({ error: "Refresh token saknas" });

  let payload;
  try { payload = verifyRefresh(refreshToken); }
  catch { return res.status(401).json({ error: "Ogiltig eller utgången refresh token" }); }

  // Verify token exists in DB (rotation check)
  const tokenHash = hashToken(refreshToken);
  const stored = db.prepare("SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ?")
    .get(tokenHash, payload.sub);

  if (!stored || stored.expires_at < Math.floor(Date.now() / 1000)) {
    // Possible token reuse — invalidate all tokens for user
    db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").run(payload.sub);
    return res.status(401).json({ error: "Token ogiltig. Logga in igen." });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
  if (!user) return res.status(401).json({ error: "Användare hittades inte" });

  // Rotate: delete old, issue new
  db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").run(tokenHash);
  const { accessToken, refreshToken: newRefreshToken } = issueTokens(user.id, user.email, user.name, user.role);

  res.json({ accessToken, refreshToken: newRefreshToken });
});

// ── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", requireAuth, (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (refreshToken) {
    db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").run(hashToken(refreshToken));
  }
  res.json({ ok: true });
});

// ── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(req.user.sub);
  if (!user) return res.status(404).json({ error: "Användare hittades inte" });
  res.json({ user });
});

// ── PATCH /auth/me ───────────────────────────────────────────────────────────
router.patch("/me", requireAuth, (req, res) => {
  const { name } = req.body ?? {};
  if (!name || !name.trim()) return res.status(400).json({ error: "Namn krävs" });
  db.prepare("UPDATE users SET name = ?, updated_at = unixepoch() WHERE id = ?")
    .run(name.trim(), req.user.sub);
  res.json({ ok: true, name: name.trim() });
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function issueTokens(userId, email, name, role) {
  const payload = { sub: userId, email, name, role };
  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // Store hashed refresh token
  const expiresAt = Math.floor((Date.now() + REFRESH_TTL_MS) / 1000);
  db.prepare("INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .run(uuid(), userId, hashToken(refreshToken), expiresAt);

  // Clean up expired tokens for this user
  db.prepare("DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < unixepoch()").run(userId);

  return { accessToken, refreshToken };
}

module.exports = router;
