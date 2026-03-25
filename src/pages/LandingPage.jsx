import { useState } from "react";
import { ArrowRight, CheckCircle, Lock, LogIn, User, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AuthModal, UserMenu } from "../AuthModal";
import { modules, programPath, outcomes, PROGRAM_PRICE_DISPLAY, PROGRAM_ID } from "../aiProgram";

export function LandingPage({ onGetAccess, onGoToDashboard }) {
  const { isLoggedIn, loading, user, ownedCourses } = useAuth();
  const [showAuth,     setShowAuth]     = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const hasPurchased = ownedCourses.includes(PROGRAM_ID) || ownedCourses.length > 0;

  const handleCTA = () => {
    if (hasPurchased) {
      onGoToDashboard();
    } else if (!isLoggedIn) {
      setShowAuth(true);
    } else {
      onGetAccess();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {showAuth     && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUserMenu && <UserMenu  onClose={() => setShowUserMenu(false)} />}

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={20} style={{ color: "var(--accent)" }} />
            <span style={{ fontWeight: 800, fontSize: 17, fontFamily: "'Syne', sans-serif" }}>AI Builder</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {!loading && (
              isLoggedIn ? (
                <>
                  {hasPurchased && (
                    <button onClick={onGoToDashboard} className="btn btn-dark btn-sm">My Program</button>
                  )}
                  <button onClick={() => setShowUserMenu(true)} className="btn btn-dark btn-sm" style={{ gap: 6 }}>
                    <User size={14} /> {user?.name?.split(" ")[0]}
                  </button>
                </>
              ) : (
                <button onClick={() => setShowAuth(true)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                  <LogIn size={14} /> Sign in
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "80px 24px 64px", maxWidth: 780, margin: "0 auto" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(87,246,255,.08)",
          border: "1px solid rgba(87,246,255,.2)",
          borderRadius: 999,
          padding: "6px 18px",
          fontSize: 13,
          color: "var(--accent)",
          fontWeight: 700,
          marginBottom: 28,
          letterSpacing: 0.5,
        }}>
          AI Automation Builder Program
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 60px)",
          fontWeight: 900,
          lineHeight: 1.08,
          marginBottom: 22,
          fontFamily: "'Syne', sans-serif",
        }}>
          Build 3 AI tools that<br />
          <span style={{ background: "linear-gradient(90deg,var(--accent),var(--accent-2,#ff59d6))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            save you hours every week
          </span>
        </h1>

        <p style={{ fontSize: 19, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
          Learn step-by-step how to build real AI apps — no experience needed
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleCTA}
            className="btn btn-primary"
            style={{ fontSize: 16, padding: "14px 32px", gap: 8 }}
          >
            {hasPurchased ? "Continue learning" : "Start building now"}
            <ArrowRight size={17} />
          </button>
          {!hasPurchased && (
            <span style={{ fontSize: 14, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={13} style={{ color: "var(--accent)" }} />
              One-time payment · Lifetime access
            </span>
          )}
        </div>
      </section>

      {/* ── What you'll build ────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 800, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          What you will build
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 44 }}>3 real AI tools you can use and sell</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {modules.map((mod, i) => (
            <div
              key={mod.id}
              className="panel animate-up"
              style={{ borderTop: `3px solid ${mod.accent}` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 34 }}>{mod.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: mod.accent, marginBottom: 3, letterSpacing: 1, textTransform: "uppercase" }}>
                    Module {i + 1}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{mod.title}</h3>
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 18 }}>{mod.tagline}</p>

              {/* lesson topic pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {mod.topics.slice(0, 5).map(topic => (
                  <span key={topic} style={{ fontSize: 12, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 999, padding: "3px 10px", color: "var(--text-muted)" }}>
                    {topic}
                  </span>
                ))}
                {mod.topics.length > 5 && (
                  <span style={{ fontSize: 12, color: mod.accent, padding: "3px 4px" }}>
                    +{mod.topics.length - 5} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Program structure ────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 660, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 800, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          Program structure
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 40 }}>
          A clear path from zero to deployed AI tools
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {programPath.map((step) => (
            <div key={step.step} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "var(--accent)", color: "#031017",
                fontWeight: 800, fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {step.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Outcomes ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 660, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 800, marginBottom: 40, fontFamily: "'Syne', sans-serif" }}>
          After this program you will be able to:
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {outcomes.map(item => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <CheckCircle size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 16, lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 800, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          What students are saying
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 44 }}>Real results from real people</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { name: "Marcus T.",  role: "Freelance Developer",  avatar: "MT", accent: "#57f6ff", text: "I built and deployed my first AI chatbot in a weekend. My client was blown away. Already charged $800 for it." },
            { name: "Sara L.",    role: "Marketing Manager",    avatar: "SL", accent: "#a78bfa", text: "The content generator alone saves me 6+ hours every week. I generate a full week of posts in under 10 minutes now." },
            { name: "James K.",   role: "Agency Owner",         avatar: "JK", accent: "#34d399", text: "At $29 this is insane value. I've resold the chatbot module to 3 clients already. Paid for itself 10x over." },
            { name: "Priya M.",   role: "E-commerce Founder",   avatar: "PM", accent: "#57f6ff", text: "No coding background and I still got through every module. The step-by-step format makes it easy to follow." },
            { name: "Tom R.",     role: "SaaS Entrepreneur",    avatar: "TR", accent: "#a78bfa", text: "The email automation module is exactly what I needed. Set it up once and it runs completely on its own." },
            { name: "Aisha B.",   role: "Content Creator",      avatar: "AB", accent: "#34d399", text: "I was skeptical at first but the quality surprised me. Everything actually works in real life, not just demos." },
          ].map((t) => (
            <div key={t.name} className="panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#fbbf24", fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text-muted)", margin: 0, flex: 1 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${t.accent}22`, border: `1px solid ${t.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: t.accent, flexShrink: 0 }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px 100px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div className="panel" style={{ borderColor: "rgba(87,246,255,.3)", background: "var(--surface)" }}>
          {/* Lock icon for guests */}
          {!hasPurchased && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Lock size={28} style={{ color: "var(--accent)", opacity: 0.5 }} />
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5 }}>
            Get instant access
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
            ${PROGRAM_PRICE_DISPLAY}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
            One-time payment · Lifetime access · All 3 modules
          </div>

          <button
            onClick={handleCTA}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: 16, padding: "14px", justifyContent: "center", gap: 8 }}
          >
            {hasPurchased ? "Continue learning" : "Get instant access"}
            <ArrowRight size={17} />
          </button>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "All 3 AI tool modules (21 lessons)",
              "Step-by-step project code",
              "Certificate of completion",
              "Lifetime access",
              "Future updates included",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text-muted)", justifyContent: "center" }}>
                <CheckCircle size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
