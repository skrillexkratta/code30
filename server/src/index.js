require("dotenv").config();
const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const rateLimit   = require("express-rate-limit");

// Initialize DB (runs migrations)
require("./db");

const authRouter        = require("./routes/auth");
const progressRouter    = require("./routes/progress");
const achievementsRouter = require("./routes/achievements");
const adminRouter       = require("./routes/admin");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: "För många förfrågningar, försök igen om 15 minuter" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 120,
  message: { error: "För många förfrågningar" },
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRouter);
app.use("/api/progress",     progressRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/admin",        adminRouter);

// Health check
app.get("/health", (req, res) => res.json({
  status: "ok",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
}));

// ── 404 & Error handlers ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Rutten hittades inte" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internt serverfel" });
});

app.listen(PORT, () => {
  console.log(`🚀 Code30 API körs på port ${PORT}`);
  console.log(`   Miljö: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
