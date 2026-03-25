const router = require("express").Router();
const { v4: uuid } = require("uuid");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { checkAchievements } = require("./achievements");

// All routes require auth
router.use(requireAuth);

// ── GET /progress ────────────────────────────────────────────────────────────
// Returns all progress + owned courses for the logged-in user
router.get("/", (req, res) => {
  const userId = req.user.sub;

  const progressRows = db.prepare(
    "SELECT course_id, day, completed_at FROM progress WHERE user_id = ? ORDER BY course_id, day"
  ).all(userId);

  const ownedRows = db.prepare(
    "SELECT course_id, purchased_at FROM owned_courses WHERE user_id = ?"
  ).all(userId);

  const achievementRows = db.prepare(
    "SELECT achievement, unlocked_at FROM achievements WHERE user_id = ?"
  ).all(userId);

  // Group progress by course
  const progressByCourse = {};
  for (const row of progressRows) {
    if (!progressByCourse[row.course_id]) progressByCourse[row.course_id] = [];
    progressByCourse[row.course_id].push(row.day);
  }

  res.json({
    progress: progressByCourse,
    ownedCourses: ownedRows.map(r => r.course_id),
    achievements: achievementRows.map(r => r.achievement),
  });
});

// ── POST /progress/:courseId/complete ─────────────────────────────────────────
// Mark a day as complete
router.post("/:courseId/complete", (req, res) => {
  const userId   = req.user.sub;
  const courseId = req.params.courseId;
  const { day }  = req.body ?? {};

  if (!day || typeof day !== "number" || day < 1 || day > 30)
    return res.status(400).json({ error: "Ogiltig dag (1-30)" });

  // Check course access
  const owned = db.prepare(
    "SELECT id FROM owned_courses WHERE user_id = ? AND course_id = ?"
  ).get(userId, courseId);

  const isFreeDay = day === 1;
  if (!owned && !isFreeDay)
    return res.status(403).json({ error: "Du äger inte denna kurs" });

  db.prepare(`
    INSERT OR IGNORE INTO progress (id, user_id, course_id, day)
    VALUES (?, ?, ?, ?)
  `).run(uuid(), userId, courseId, day);

  // Check for new achievements
  const newAchievements = checkAchievements(userId, courseId, day);

  res.json({ ok: true, newAchievements });
});

// ── DELETE /progress/:courseId/complete/:day ──────────────────────────────────
// Unmark a day
router.delete("/:courseId/complete/:day", (req, res) => {
  const userId   = req.user.sub;
  const courseId = req.params.courseId;
  const day      = parseInt(req.params.day, 10);

  db.prepare(
    "DELETE FROM progress WHERE user_id = ? AND course_id = ? AND day = ?"
  ).run(userId, courseId, day);

  res.json({ ok: true });
});

// ── POST /progress/:courseId/unlock ──────────────────────────────────────────
// Unlock a course (called after payment)
router.post("/:courseId/unlock", (req, res) => {
  const userId   = req.user.sub;
  const courseId = req.params.courseId;
  const { pricePaid = 99 } = req.body ?? {};

  db.prepare(`
    INSERT OR IGNORE INTO owned_courses (id, user_id, course_id, price_paid)
    VALUES (?, ?, ?, ?)
  `).run(uuid(), userId, courseId, pricePaid);

  const newAchievements = checkAchievements(userId, courseId, null);

  res.json({ ok: true, newAchievements });
});

module.exports = router;
