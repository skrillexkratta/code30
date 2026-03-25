const router = require("express").Router();
const { v4: uuid } = require("uuid");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

// ── Achievement definitions ───────────────────────────────────────────────────
const ACHIEVEMENTS = {
  FIRST_DAY:       { id: "FIRST_DAY",       title: "Första steget",      emoji: "🐣", desc: "Slutförde din första lektion" },
  STREAK_3:        { id: "STREAK_3",         title: "På gång",            emoji: "🔥", desc: "3 dagars streak" },
  STREAK_7:        { id: "STREAK_7",         title: "En vecka stark",     emoji: "⚡", desc: "7 dagars streak" },
  STREAK_14:       { id: "STREAK_14",        title: "Halvmåne",           emoji: "🌙", desc: "14 dagars streak" },
  STREAK_30:       { id: "STREAK_30",        title: "Månadshjälte",       emoji: "🏆", desc: "30 dagars streak" },
  HALFWAY:         { id: "HALFWAY",          title: "Halvvägs",           emoji: "🎯", desc: "Dag 15 klar" },
  COURSE_COMPLETE: { id: "COURSE_COMPLETE",  title: "Kurs klar",          emoji: "🎓", desc: "Slutförde en hel kurs" },
  TWO_COURSES:     { id: "TWO_COURSES",      title: "Mångsysslare",       emoji: "📚", desc: "Slutförde 2 kurser" },
  ALL_COURSES:     { id: "ALL_COURSES",      title: "Full Stack Legend",  emoji: "🌟", desc: "Slutförde alla kurser" },
  FIRST_PURCHASE:  { id: "FIRST_PURCHASE",   title: "Investering",        emoji: "💎", desc: "Köpte din första kurs" },
};

// Check and award achievements — returns array of newly unlocked ones
function checkAchievements(userId, courseId, day) {
  const newlyUnlocked = [];

  // Helper: unlock if not already awarded
  function unlock(achievementId) {
    const existing = db.prepare(
      "SELECT id FROM achievements WHERE user_id = ? AND achievement = ?"
    ).get(userId, achievementId);
    if (!existing) {
      db.prepare("INSERT INTO achievements (id, user_id, achievement) VALUES (?, ?, ?)")
        .run(uuid(), userId, achievementId);
      newlyUnlocked.push({ ...ACHIEVEMENTS[achievementId] });
    }
  }

  // Get all progress for streak calculation
  const allProgress = db.prepare(
    "SELECT DISTINCT course_id, day FROM progress WHERE user_id = ? ORDER BY course_id, day"
  ).all(userId);

  const totalDays = allProgress.length;

  // First day ever
  if (totalDays === 1) unlock("FIRST_DAY");

  // Streak calculation (consecutive days within a course)
  if (courseId) {
    const courseDays = allProgress
      .filter(p => p.course_id === courseId)
      .map(p => p.day)
      .sort((a, b) => a - b);

    let maxStreak = 1, streak = 1;
    for (let i = 1; i < courseDays.length; i++) {
      streak = courseDays[i] === courseDays[i-1] + 1 ? streak + 1 : 1;
      maxStreak = Math.max(maxStreak, streak);
    }

    if (maxStreak >= 3)  unlock("STREAK_3");
    if (maxStreak >= 7)  unlock("STREAK_7");
    if (maxStreak >= 14) unlock("STREAK_14");
    if (maxStreak >= 30) unlock("STREAK_30");

    // Halfway (day 15)
    if (day === 15) unlock("HALFWAY");

    // Course complete (day 30)
    if (day === 30) {
      const completedDays = courseDays.length;
      if (completedDays >= 30) {
        unlock("COURSE_COMPLETE");

        // Check multi-course completions
        const completedCourses = db.prepare(`
          SELECT course_id FROM progress WHERE user_id = ?
          GROUP BY course_id HAVING COUNT(*) >= 30
        `).all(userId);

        if (completedCourses.length >= 2) unlock("TWO_COURSES");
        if (completedCourses.length >= 4) unlock("ALL_COURSES");
      }
    }
  }

  // First purchase
  const owned = db.prepare("SELECT COUNT(*) as c FROM owned_courses WHERE user_id = ?").get(userId);
  if (owned.c >= 1) unlock("FIRST_PURCHASE");

  return newlyUnlocked;
}

// ── GET /achievements ─────────────────────────────────────────────────────────
router.get("/", requireAuth, (req, res) => {
  const rows = db.prepare(
    "SELECT achievement, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC"
  ).all(req.user.sub);

  const unlocked = rows.map(r => ({
    ...ACHIEVEMENTS[r.achievement],
    unlockedAt: r.unlocked_at,
  })).filter(a => a.id); // filter out any unknown achievement ids

  const all = Object.values(ACHIEVEMENTS).map(a => ({
    ...a,
    unlockedAt: rows.find(r => r.achievement === a.id)?.unlocked_at ?? null,
  }));

  res.json({ achievements: all });
});

module.exports = router;
module.exports.checkAchievements = checkAchievements;
module.exports.ACHIEVEMENTS = ACHIEVEMENTS;
