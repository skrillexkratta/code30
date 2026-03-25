const router = require("express").Router();
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.use(requireAuth, requireAdmin);

// ── GET /admin/stats ──────────────────────────────────────────────────────────
router.get("/stats", (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo  = now - 86400;
  const sevenDaysAgo = now - 7 * 86400;
  const thirtyDaysAgo = now - 30 * 86400;

  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const newToday   = db.prepare("SELECT COUNT(*) as c FROM users WHERE created_at > ?").get(oneDayAgo).c;
  const activeToday = db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM progress WHERE completed_at > ?").get(oneDayAgo).c;
  const active7d   = db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM progress WHERE completed_at > ?").get(sevenDaysAgo).c;

  const totalRevenue = db.prepare("SELECT COALESCE(SUM(price_paid), 0) as r FROM owned_courses").get().r;
  const revenue30d   = db.prepare("SELECT COALESCE(SUM(price_paid), 0) as r FROM owned_courses WHERE purchased_at > ?").get(thirtyDaysAgo).r;
  const totalPurchases = db.prepare("SELECT COUNT(*) as c FROM owned_courses").get().c;

  const courseStats = db.prepare(`
    SELECT 
      course_id,
      COUNT(DISTINCT user_id) as owners,
      COUNT(DISTINCT CASE WHEN day = 30 THEN user_id END) as completions
    FROM owned_courses
    LEFT JOIN progress USING (user_id, course_id)
    GROUP BY course_id
    ORDER BY owners DESC
  `).all();

  const dailySignups = db.prepare(`
    SELECT DATE(created_at, 'unixepoch') as date, COUNT(*) as signups
    FROM users
    WHERE created_at > ?
    GROUP BY date
    ORDER BY date
  `).all(thirtyDaysAgo);

  const dailyRevenue = db.prepare(`
    SELECT DATE(purchased_at, 'unixepoch') as date, SUM(price_paid) as revenue, COUNT(*) as purchases
    FROM owned_courses
    WHERE purchased_at > ?
    GROUP BY date
    ORDER BY date
  `).all(thirtyDaysAgo);

  const topLessons = db.prepare(`
    SELECT course_id, day, COUNT(*) as completions
    FROM progress
    GROUP BY course_id, day
    ORDER BY completions DESC
    LIMIT 10
  `).all();

  const dropoffByDay = db.prepare(`
    SELECT course_id, day, COUNT(DISTINCT user_id) as users
    FROM progress
    GROUP BY course_id, day
    ORDER BY course_id, day
  `).all();

  res.json({
    overview: {
      totalUsers, newToday, activeToday, active7d,
      totalRevenue, revenue30d, totalPurchases,
    },
    courseStats,
    dailySignups,
    dailyRevenue,
    topLessons,
    dropoffByDay,
  });
});

// ── GET /admin/users ──────────────────────────────────────────────────────────
router.get("/users", (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  const total = db.prepare(
    "SELECT COUNT(*) as c FROM users WHERE email LIKE ? OR name LIKE ?"
  ).get(`%${search}%`, `%${search}%`).c;

  const users = db.prepare(`
    SELECT 
      u.id, u.email, u.name, u.role, u.created_at,
      COUNT(DISTINCT oc.course_id) as owned_courses,
      COUNT(DISTINCT p.course_id || '-' || p.day) as days_completed,
      COALESCE(SUM(oc.price_paid), 0) as total_spent
    FROM users u
    LEFT JOIN owned_courses oc ON u.id = oc.user_id
    LEFT JOIN progress p ON u.id = p.user_id
    WHERE u.email LIKE ? OR u.name LIKE ?
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(`%${search}%`, `%${search}%`, limit, offset);

  res.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
});

// ── POST /admin/users/:id/grant ───────────────────────────────────────────────
router.post("/users/:id/grant", (req, res) => {
  const { courseId } = req.body ?? {};
  if (!courseId) return res.status(400).json({ error: "courseId krävs" });

  const { v4: uuid } = require("uuid");
  db.prepare("INSERT OR IGNORE INTO owned_courses (id, user_id, course_id, price_paid) VALUES (?, ?, ?, 0)")
    .run(uuid(), req.params.id, courseId);

  res.json({ ok: true });
});

module.exports = router;
