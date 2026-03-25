import { useState } from "react";
import { ArrowRight, BookOpen, Lock, LogOut, User, Zap } from "lucide-react";
import { ProgressBar } from "../components/UI";
import { useAuth } from "../hooks/useAuth";
import { modules, PROGRAM_ID } from "../aiProgram";
import { UserMenu } from "../AuthModal";

export function Dashboard({ onStartModule, onGoToLanding }) {
  const { user, logout, ownedCourses, progress } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const hasPurchased = ownedCourses.includes(PROGRAM_ID) || ownedCourses.length > 0;

  const handleLogout = async () => {
    await logout();
    onGoToLanding();
  };

  const getProgress = (moduleId) => {
    const completed = progress[moduleId] || [];
    const mod       = modules.find(m => m.id === moduleId);
    if (!mod || mod.lessons === 0) return 0;
    return Math.round((completed.length / mod.lessons) * 100);
  };

  const getNextLesson = (moduleId) => {
    const completed = progress[moduleId] || [];
    const mod       = modules.find(m => m.id === moduleId);
    if (!mod) return null;
    for (let i = 1; i <= mod.lessons; i++) {
      if (!completed.includes(i)) return i;
    }
    return null;
  };

  const totalLessons    = modules.reduce((s, m) => s + m.lessons, 0);
  const completedTotal  = modules.reduce((s, m) => s + (progress[m.id] || []).length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={onGoToLanding}>
            <Zap size={20} style={{ color: "var(--accent)" }} />
            <span style={{ fontWeight: 800, fontSize: 17, fontFamily: "'Syne', sans-serif" }}>AI Builder</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setShowUserMenu(true)} className="btn btn-dark btn-sm" style={{ gap: 6 }}>
              <User size={14} /> {user?.name?.split(" ")[0]}
            </button>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ gap: 6 }} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── Welcome ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            {hasPurchased
              ? completedTotal > 0
                ? `${completedTotal} of ${totalLessons} lessons completed · Keep going!`
                : "You have full access to all 3 modules. Start below."
              : "Get access to start building your AI tools."}
          </p>
        </div>

        {!hasPurchased ? (
          /* ── Not purchased ─────────────────────────────────────────── */
          <div className="panel" style={{ textAlign: "center", maxWidth: 480, borderColor: "rgba(87,246,255,.2)" }}>
            <Lock size={40} style={{ color: "var(--accent)", opacity: 0.35, marginBottom: 16 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Program locked</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
              Get full access to all 3 AI modules and 21 step-by-step lessons.
            </p>
            <button
              onClick={onGoToLanding}
              className="btn btn-primary"
              style={{ fontSize: 15, padding: "12px 28px" }}
            >
              Get instant access <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            {/* ── Overall progress bar ──────────────────────────────── */}
            {completedTotal > 0 && (
              <div className="panel" style={{ marginBottom: 32, maxWidth: 480 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700 }}>Overall progress</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{overallProgress}%</span>
                </div>
                <ProgressBar value={overallProgress} />
                <p className="caption" style={{ marginTop: 8 }}>
                  {completedTotal} / {totalLessons} lessons completed
                </p>
              </div>
            )}

            {/* ── Module cards ──────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {modules.map((mod, i) => {
                const prog       = getProgress(mod.id);
                const nextLesson = getNextLesson(mod.id);
                const isDone     = prog === 100;

                return (
                  <div
                    key={mod.id}
                    className="panel animate-up"
                    style={{ borderTop: `3px solid ${mod.accent}` }}
                  >
                    {/* Module header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <span style={{ fontSize: 30 }}>{mod.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: mod.accent, marginBottom: 2, letterSpacing: 1, textTransform: "uppercase" }}>
                          Module {i + 1}
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{mod.title}</h3>
                      </div>
                      {isDone && (
                        <span style={{ marginLeft: "auto", fontSize: 12, background: `${mod.accent}22`, color: mod.accent, border: `1px solid ${mod.accent}44`, borderRadius: 999, padding: "3px 10px", fontWeight: 700 }}>
                          ✓ Done
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: "var(--text-muted)" }}>Progress</span>
                        <span style={{ color: mod.accent, fontWeight: 700 }}>{prog}%</span>
                      </div>
                      <ProgressBar value={prog} />
                    </div>

                    {/* Lesson count */}
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>
                      <BookOpen size={13} />
                      {mod.lessons} lessons
                      {nextLesson && !isDone && (
                        <span style={{ color: mod.accent }}>· Next: Lesson {nextLesson}</span>
                      )}
                    </div>

                    <button
                      onClick={() => onStartModule(mod.id)}
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", background: mod.accent, color: "#031017", gap: 8 }}
                    >
                      {prog > 0 && !isDone ? "Continue" : isDone ? "Review" : "Start module"}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
