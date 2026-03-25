const jwt = require("jsonwebtoken");

const JWT_SECRET        = process.env.JWT_SECRET        || "dev-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production";
const ACCESS_TTL        = "15m";
const REFRESH_TTL       = "30d";
const REFRESH_TTL_MS    = 30 * 24 * 60 * 60 * 1000;

function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

function signRefresh(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

function verifyAccess(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefresh(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

// Express middleware — attaches req.user if valid token
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Inte inloggad" });
  }
  try {
    req.user = verifyAccess(header.slice(7));
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token utgången", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Ogiltig token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Ingen åtkomst" });
  }
  next();
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh, requireAuth, requireAdmin, REFRESH_TTL_MS };
