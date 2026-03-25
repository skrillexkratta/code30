// ── utils/storage.js ─────────────────────────────────────────────────────────
export const storage = {
  get: (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

// ── utils/streak.js ───────────────────────────────────────────────────────────
export function calcStreak(days) {
  if (!days.length) return 0;
  const sorted = [...days].sort((a, b) => b - a);
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] - sorted[i + 1] === 1) streak++;
    else break;
  }
  return streak;
}
