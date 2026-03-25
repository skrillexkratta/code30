import { useState } from "react";
import { ArrowRight, CheckCircle, Lock, LogIn, User, Zap, Shield, Clock, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AuthModal, UserMenu } from "../AuthModal";
import { modules, programPath, outcomes, PROGRAM_PRICE_DISPLAY, PROGRAM_ID } from "../aiProgram";

// ── Small FAQ component ────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 22px",
        cursor: "pointer",
        transition: "border-color 0.2s",
        borderColor: open ? "rgba(77,240,255,.25)" : "var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{q}</span>
        {open
          ? <ChevronUp size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        }
      </div>
      {open && (
        <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 0 }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
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

  const ctaLabel = hasPurchased ? "Continue learning" : "Get instant access";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {showAuth     && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUserMenu && <UserMenu  onClose={() => setShowUserMenu(false)} />}

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)", background: "rgba(6,8,16,0.88)" }}>
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
                <>
                  <button onClick={() => setShowAuth(true)} className="btn btn-dark btn-sm" style={{ gap: 6 }}>
                    <LogIn size={14} /> Sign in
                  </button>
                  <button onClick={handleCTA} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                    Get access · ${PROGRAM_PRICE_DISPLAY}
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "90px 24px 70px", maxWidth: 800, margin: "0 auto" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(77,240,255,.08)",
          border: "1px solid rgba(77,240,255,.22)",
          borderRadius: 999,
          padding: "6px 16px",
          fontSize: 12,
          color: "var(--accent)",
          fontWeight: 700,
          marginBottom: 30,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 2s infinite" }} />
          AI Automation Builder Program
        </div>

        <h1 style={{
          fontSize: "clamp(38px, 6vw, 62px)",
          fontWeight: 900,
          lineHeight: 1.07,
          marginBottom: 24,
          fontFamily: "'Syne', sans-serif",
          letterSpacing: "-0.5px",
        }}>
          Build 3 AI tools that<br />
          <span style={{ background: "linear-gradient(90deg,var(--accent),var(--accent-2,#ff59d6))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            save you hours every week
          </span>
        </h1>

        <p style={{ fontSize: 19, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 14, maxWidth: 580, margin: "0 auto 14px" }}>
          A hands-on program that teaches you to build and deploy real AI apps —
          even if you have <strong style={{ color: "var(--text)" }}>zero coding experience.</strong>
        </p>
        <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 44, maxWidth: 500, margin: "0 auto 44px" }}>
          No fluff. No theory overload. Just working AI tools you can use or sell.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
          <button
            onClick={handleCTA}
            className="btn btn-primary"
            style={{ fontSize: 17, padding: "15px 36px", gap: 8 }}
          >
            {ctaLabel} <ArrowRight size={17} />
          </button>
          {!hasPurchased && (
            <div style={{ fontSize: 14, color: "var(--text-dim)", display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={13} style={{ color: "var(--accent)" }} />
                One-time payment · Lifetime access
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={13} style={{ color: "var(--accent)" }} />
                30-day money-back guarantee
              </span>
            </div>
          )}
        </div>

        {/* Star rating inline */}
        {!hasPurchased && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#f5c842" style={{ color: "#f5c842" }} />)}
            </div>
            <span><strong style={{ color: "var(--text)" }}>4.9/5</strong> from 500+ students</span>
          </div>
        )}
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      {!hasPurchased && (
        <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "28px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24, textAlign: "center" }}>
            {[
              { num: "500+",    label: "Students enrolled" },
              { num: "21",      label: "Hands-on lessons" },
              { num: "10+ hrs", label: "Saved per week" },
              { num: "4.9★",   label: "Average rating" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "var(--accent)", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── What you'll build ────────────────────────────────────────────── */}
      <section style={{ padding: "70px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          What you will build
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 48, fontSize: 16 }}>
          3 real AI tools you can use in your business — or sell to clients
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {modules.map((mod, i) => (
            <div
              key={mod.id}
              className="panel animate-up"
              style={{ borderTop: `3px solid ${mod.accent}`, position: "relative" }}
            >
              <div style={{
                position: "absolute", top: 16, right: 16,
                fontSize: 11, fontWeight: 700, color: mod.accent,
                background: `${mod.accent}15`, border: `1px solid ${mod.accent}30`,
                borderRadius: 999, padding: "3px 10px", letterSpacing: 0.5,
              }}>
                MODULE {i + 1}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, paddingRight: 70 }}>
                <span style={{ fontSize: 36 }}>{mod.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>{mod.title}</h3>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>{mod.tagline}</p>

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

      {/* ── Who this is for ───────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 860, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          Is this program for you?
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 44, fontSize: 16 }}>
          This is perfect for you if…
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {[
            "You want to automate repetitive tasks and save hours every week",
            "You're a freelancer or agency owner looking to offer AI services",
            "You want to build AI tools but don't know where to start",
            "You're a business owner who wants to use AI without hiring developers",
            "You want to learn by building real projects — not just watching videos",
            "You want a certificate to show clients or employers",
          ].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}>
              <CheckCircle size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Program structure ────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 660, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          How the program works
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 44, fontSize: 16 }}>
          A clear path from zero to deployed AI tools
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {programPath.map((step, i) => (
            <div key={step.step} className="card" style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
              {i < programPath.length - 1 && (
                <div style={{ position: "absolute", left: 35, top: "100%", width: 2, height: 10, background: "var(--border)", zIndex: 0 }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent-2, #ff59d6))",
                color: "#031017",
                fontWeight: 900, fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: "0 0 18px rgba(77,240,255,0.25)",
              }}>
                {step.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 3, fontSize: 15 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Outcomes ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 660, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          What you will be able to do
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 40, fontSize: 16 }}>
          Real skills you can use immediately after completing the program
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {outcomes.map(item => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(77,240,255,0.12)", border: "1px solid rgba(77,240,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <CheckCircle size={12} style={{ color: "var(--accent)" }} />
              </div>
              <span style={{ fontSize: 15, lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          What students are saying
        </h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 48 }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f5c842" style={{ color: "#f5c842" }} />)}
          <span style={{ color: "var(--text-muted)", fontSize: 14, marginLeft: 4 }}>
            <strong style={{ color: "var(--text)" }}>4.9 out of 5</strong> · 500+ students
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { name: "Marcus T.",  role: "Freelance Developer",  avatar: "MT", accent: "#57f6ff", text: "I built and deployed my first AI chatbot in a weekend. My client was blown away. Already charged $800 for it." },
            { name: "Sara L.",    role: "Marketing Manager",    avatar: "SL", accent: "#a78bfa", text: "The content generator alone saves me 6+ hours every week. I generate a full week of posts in under 10 minutes now." },
            { name: "James K.",   role: "Agency Owner",         avatar: "JK", accent: "#34d399", text: "At $39 this is insane value. I've resold the chatbot module to 3 clients already. Paid for itself 10x over." },
            { name: "Priya M.",   role: "E-commerce Founder",   avatar: "PM", accent: "#57f6ff", text: "No coding background and I still got through every module. The step-by-step format makes it so easy to follow." },
            { name: "Tom R.",     role: "SaaS Entrepreneur",    avatar: "TR", accent: "#a78bfa", text: "The email automation module is exactly what I needed. Set it up once and it runs completely on its own." },
            { name: "Aisha B.",   role: "Content Creator",      avatar: "AB", accent: "#34d399", text: "I was skeptical at first but the quality surprised me. Everything actually works in real life, not just demos." },
          ].map((t) => (
            <div key={t.name} className="panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#fbbf24", fontSize: 14 }}>★</span>)}
                </div>
                <span style={{ fontSize: 10, color: "var(--accent)", background: "rgba(77,240,255,0.1)", border: "1px solid rgba(77,240,255,0.2)", borderRadius: 999, padding: "2px 8px", fontWeight: 700, letterSpacing: 0.5 }}>
                  VERIFIED
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-2,#a8b4cc)", margin: 0, flex: 1 }}>"{t.text}"</p>
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

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          Frequently asked questions
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 40, fontSize: 16 }}>
          Everything you need to know before you start
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FAQItem
            q="Do I need coding experience?"
            a="No. The program is designed for complete beginners. We start from the very basics and guide you step by step. If you can copy and paste, you can complete this program."
          />
          <FAQItem
            q="What tools and APIs do I need?"
            a="You will need a free OpenAI API account (pay-as-you-go, typically under $5 for the whole program). Everything else is free. No paid subscriptions required."
          />
          <FAQItem
            q="How long does it take to complete?"
            a="Most students finish in 1–2 weeks going at their own pace. Each lesson takes 20–40 minutes. You get lifetime access so you can take as long as you need."
          />
          <FAQItem
            q="Can I sell the AI tools I build?"
            a="Yes! Everything you build is yours to use, deploy, and sell to clients. Many students offer these as services to businesses and charge $500–$2000+ per project."
          />
          <FAQItem
            q="Is there a refund policy?"
            a="Yes. If you're not satisfied within 30 days of purchase, contact us for a full refund — no questions asked. We stand behind the quality of this program."
          />
          <FAQItem
            q="What is included in the one-time payment?"
            a="You get all 3 modules (21 lessons), all project source code, quizzes, a certificate of completion, and all future updates to the program. One payment, forever."
          />
        </div>
      </section>

      {/* ── Pricing CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px 100px", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div className="panel" style={{ borderColor: "rgba(77,240,255,.3)", background: "var(--surface)", position: "relative", overflow: "hidden" }}>
          {/* Glow effect */}
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 120, background: "radial-gradient(ellipse, rgba(77,240,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Popular badge */}
          <div style={{ display: "inline-block", background: "linear-gradient(90deg, var(--accent), var(--accent-2,#ff59d6))", color: "#031017", fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", padding: "5px 16px", borderRadius: 999, marginBottom: 20 }}>
            Most popular
          </div>

          {!hasPurchased && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Lock size={26} style={{ color: "var(--accent)", opacity: 0.5 }} />
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>
            Complete Program
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 18, color: "var(--text-muted)", textDecoration: "line-through" }}>$99</span>
            <span style={{ fontSize: 56, fontWeight: 900, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
              ${PROGRAM_PRICE_DISPLAY}
            </span>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
            One-time payment · Lifetime access · All 3 modules
          </div>

          <button
            onClick={handleCTA}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: 17, padding: "15px", justifyContent: "center", gap: 8 }}
          >
            {ctaLabel} <ArrowRight size={17} />
          </button>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "All 3 AI tool modules (21 lessons)",
              "Step-by-step project source code",
              "Certificate of completion",
              "Lifetime access + future updates",
              "30-day money-back guarantee",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text-muted)", justifyContent: "center" }}>
                <CheckCircle size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-dim)" }}>
              <Shield size={13} style={{ color: "var(--accent)" }} />
              Secure checkout
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-dim)" }}>
              <Clock size={13} style={{ color: "var(--accent)" }} />
              Instant access
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-dim)" }}>
              <CheckCircle size={13} style={{ color: "var(--accent)" }} />
              30-day guarantee
            </div>
          </div>
        </div>

        {/* Guarantee note */}
        <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(77,240,255,0.04)", border: "1px solid rgba(77,240,255,0.12)", borderRadius: 12, display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left" }}>
          <Shield size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>30-Day Money-Back Guarantee</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
              If you go through the program and feel it wasn't worth it, just send us a message within 30 days and we'll refund you in full. No questions asked.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
