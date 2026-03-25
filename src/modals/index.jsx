import { useState, useRef, useEffect } from "react";
import { Check, ChevronRight, Download, RotateCcw, X } from "lucide-react";
import { FocusTrap } from "../components/UI";
import { useTranslation } from "../i18n/useTranslation";

// ── Base Modal Shell ──────────────────────────────────────────────────────────
function ModalShell({ onClose, maxWidth = 480, children, label }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="presentation">
      <FocusTrap active>
        <div className="modal animate-slide-up" style={{ maxWidth }} role="dialog" aria-modal="true" aria-label={label}>
          {children}
        </div>
      </FocusTrap>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="modal-header">
      <div>
        {subtitle && <p className="label mb-4">{subtitle}</p>}
        <h2 className="section-title" style={{ marginBottom: 0, fontSize: 20 }}>{title}</h2>
      </div>
      <button onClick={onClose} className="btn btn-dark btn-icon shrink-0" aria-label={t("close")}>
        <X size={16} />
      </button>
    </div>
  );
}

// ── Quiz Modal ────────────────────────────────────────────────────────────────
export function QuizModal({ lesson, onClose, onPass }) {
  const { t } = useTranslation();
  const [cur, setCur]         = useState(0);
  const [sel, setSel]         = useState(null);
  const [answers, setAnswers] = useState([]);
  const [done, setDone]       = useState(false);
  const [showExp, setShowExp] = useState(false);

  const q = lesson.quiz[cur];

  const handleSelect = (idx) => {
    if (sel !== null) return;
    setSel(idx);
    setShowExp(true);
    const correct = idx === q.ans;
    setTimeout(() => {
      const next = [...answers, correct];
      if (cur + 1 < lesson.quiz.length) {
        setAnswers(next); setCur(c => c + 1); setSel(null); setShowExp(false);
      } else {
        setAnswers(next); setDone(true);
      }
    }, 1400);
  };

  const reset = () => { setCur(0); setSel(null); setAnswers([]); setDone(false); setShowExp(false); };
  const score = answers.filter(Boolean).length;

  return (
    <ModalShell onClose={onClose} label={t("quizTitle", { n: lesson.day })}>
      <ModalHeader title={lesson.title} subtitle={t("quizTitle", { n: lesson.day })} onClose={onClose} />

      {!done ? (
        <>
          <div className="quiz-progress" aria-label={`${cur + 1} / ${lesson.quiz.length}`}>
            {lesson.quiz.map((_, i) => (
              <div key={i} className={`quiz-pip ${i < cur ? "done" : i === cur ? "active" : ""}`} />
            ))}
          </div>

          <p className="quiz-question">{q.q}</p>

          <div className="quiz-options" role="group">
            {q.opts.map((opt, i) => {
              let cls = "quiz-opt";
              if (sel !== null) {
                if (i === q.ans) cls += " is-correct";
                else if (i === sel) cls += " is-wrong";
              }
              return (
                <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={sel !== null} aria-pressed={sel === i}>
                  <span className="quiz-opt-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                  {opt}
                  {sel !== null && i === q.ans && <Check size={14} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {showExp && q.explanation && (
            <div className="quiz-explanation" role="status">
              <strong>💡</strong> {q.explanation}
            </div>
          )}
        </>
      ) : (
        <div className="quiz-result">
          <div className={`quiz-score-ring ${score >= 2 ? "pass" : "fail"}`} aria-label={`${score} / 3`}>
            {score}/3
          </div>
          <h3 className="quiz-result-title">{score >= 2 ? t("quizPass") : t("quizFail")}</h3>
          <p className="caption text-center mb-6">
            {score >= 2 ? t("quizPassDesc") : t("quizFailDesc")}
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            {score >= 2
              ? <button onClick={() => { onPass(); onClose(); }} className="btn btn-primary">
                  {t("quizFinish", { n: lesson.day })} <ChevronRight size={15} />
                </button>
              : <button onClick={reset} className="btn btn-secondary">
                  <RotateCcw size={14} /> {t("tryAgain")}
                </button>}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ── Certificate Modal ─────────────────────────────────────────────────────────
export function CertificateModal({ userName, course, onClose }) {
  const { t, lang } = useTranslation();
  const canvasRef = useRef(null);

  // Date formatted in the active language
  const today = new Date().toLocaleDateString(
    lang === "es" ? "es-ES" : lang === "en" ? "en-GB" : "sv-SE",
    { year: "numeric", month: "long", day: "numeric" }
  );

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#050816"); bg.addColorStop(1, "#0d1530");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
    glow.addColorStop(0, `${course.accent}22`); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = `${course.accent}55`; ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.font = "56px serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff";
    ctx.fillText("🏆", W / 2, 105);
    ctx.font = "bold 16px Arial"; ctx.fillStyle = course.accent;
    ctx.fillText(course.title.toUpperCase(), W / 2, 140);
    ctx.font = "13px Arial"; ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(t("certCongrats"), W / 2, 170);
    const grad = ctx.createLinearGradient(W / 2 - 160, 0, W / 2 + 160, 0);
    grad.addColorStop(0, course.accent); grad.addColorStop(1, "#ff59d6");
    ctx.font = "bold 34px Arial"; ctx.fillStyle = grad;
    ctx.fillText(userName || "Kursdeltagare", W / 2, 220);
    ctx.strokeStyle = `${course.accent}44`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 170, 236); ctx.lineTo(W / 2 + 170, 236); ctx.stroke();
    ctx.font = "13px Arial"; ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(`${t("certText")} ${course.title}.`, W / 2, 263);
    ctx.font = "12px Arial"; ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(today, W / 2, 308);
    ctx.font = "18px serif"; ctx.fillText("⭐ ⭐ ⭐ ⭐ ⭐", W / 2, 344);
  }, [userName, course, today, t]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `${course.id}-certificate.png`;
    a.href = canvasRef.current.toDataURL();
    a.click();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={600} label={t("certTitle")}>
      <ModalHeader title={t("certTitle")} subtitle={t("certCongrats")} onClose={onClose} />
      <canvas
        ref={canvasRef} width={556} height={390}
        style={{ width: "100%", borderRadius: "var(--r-lg)", border: `1px solid ${course.accent}44` }}
        aria-label={`${t("certTitle")} — ${userName || ""} — ${course.title}`}
        role="img"
      />
      <div className="btn-row mt-4" style={{ justifyContent: "center" }}>
        <button onClick={download} className="btn btn-primary">
          <Download size={14} /> {t("certDownload")}
        </button>
        <button onClick={onClose} className="btn btn-dark">{t("close")}</button>
      </div>
    </ModalShell>
  );
}

// ── Program Certificate Modal ─────────────────────────────────────────────────
export function ProgramCertificateModal({ userName, onClose }) {
  const canvasRef = useRef(null);
  const today = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#040810"); bg.addColorStop(1, "#0a1428");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Cyan glow top-left
    const glowL = ctx.createRadialGradient(0, 0, 0, 0, 0, 360);
    glowL.addColorStop(0, "rgba(77,240,255,0.12)"); glowL.addColorStop(1, "transparent");
    ctx.fillStyle = glowL; ctx.fillRect(0, 0, W, H);

    // Magenta glow bottom-right
    const glowR = ctx.createRadialGradient(W, H, 0, W, H, 360);
    glowR.addColorStop(0, "rgba(224,64,251,0.10)"); glowR.addColorStop(1, "transparent");
    ctx.fillStyle = glowR; ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = "rgba(77,240,255,0.35)"; ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    // Inner border
    ctx.strokeStyle = "rgba(77,240,255,0.12)"; ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Trophy
    ctx.font = "52px serif"; ctx.textAlign = "center";
    ctx.fillText("🏆", W / 2, 110);

    // "Certificate of Completion"
    ctx.font = "bold 13px Arial"; ctx.fillStyle = "#4df0ff";
    ctx.letterSpacing = "3px";
    ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 148);

    // Divider line
    ctx.strokeStyle = "rgba(77,240,255,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 180, 162); ctx.lineTo(W / 2 + 180, 162); ctx.stroke();

    // "This certifies that"
    ctx.font = "14px Arial"; ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText("This certifies that", W / 2, 192);

    // Student name
    const nameGrad = ctx.createLinearGradient(W / 2 - 180, 0, W / 2 + 180, 0);
    nameGrad.addColorStop(0, "#4df0ff"); nameGrad.addColorStop(1, "#e040fb");
    ctx.font = "bold 36px Arial"; ctx.fillStyle = nameGrad;
    ctx.fillText(userName || "Graduate", W / 2, 238);

    // Underline
    ctx.strokeStyle = "rgba(77,240,255,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 185, 252); ctx.lineTo(W / 2 + 185, 252); ctx.stroke();

    // "has successfully completed"
    ctx.font = "14px Arial"; ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText("has successfully completed the", W / 2, 280);

    // Program name
    ctx.font = "bold 20px Arial"; ctx.fillStyle = "#ffffff";
    ctx.fillText("AI Automation Builder Program", W / 2, 312);

    // Module list
    ctx.font = "12px Arial"; ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText("AI Chatbot  ·  Content Generator  ·  Email Automation", W / 2, 336);

    // Stars
    ctx.font = "16px serif"; ctx.fillStyle = "#fbbf24";
    ctx.fillText("★  ★  ★  ★  ★", W / 2, 368);

    // Date
    ctx.font = "11px Arial"; ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillText(today, W / 2, 400);

    // AI Builder brand
    ctx.font = "bold 11px Arial"; ctx.fillStyle = "rgba(77,240,255,0.4)";
    ctx.fillText("AI BUILDER", W / 2, 420);
  }, [userName, today]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `ai-builder-certificate-${(userName || "graduate").replace(/\s+/g, "-").toLowerCase()}.png`;
    a.href = canvasRef.current.toDataURL();
    a.click();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={620} label="Certificate of Completion">
      <ModalHeader title="Certificate of Completion" subtitle="🎉 You finished the program!" onClose={onClose} />
      <canvas
        ref={canvasRef} width={576} height={440}
        style={{ width: "100%", borderRadius: "var(--r-lg)", border: "1px solid rgba(77,240,255,0.25)" }}
        role="img"
        aria-label={`Certificate of Completion for ${userName || "Graduate"} — AI Automation Builder Program`}
      />
      <div className="btn-row mt-4" style={{ justifyContent: "center" }}>
        <button onClick={download} className="btn btn-primary">
          <Download size={14} /> Download Certificate
        </button>
        <button onClick={onClose} className="btn btn-dark">Close</button>
      </div>
    </ModalShell>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
export function CheckoutModal({ items, total, onClose, onPay }) {
  const { t } = useTranslation();
  return (
    <ModalShell onClose={onClose} label={t("payment")}>
      <ModalHeader title={t("checkout")} subtitle={t("payment")} onClose={onClose} />
      <div className="card mb-5">
        {items.map((item, i) => (
          <div key={i} className="cart-row">
            <span className="caption">{item.icon} {item.title}</span>
            <strong>{item.pris} kr</strong>
          </div>
        ))}
        <div className="checkout-total">
          <span style={{ fontWeight: 700 }}>{t("total")}</span>
          <strong className="gradient-text" style={{ fontSize: 20 }}>{total} kr</strong>
        </div>
      </div>
      <div className="col mb-5">
        <input className="input" placeholder={t("cardName")} aria-label={t("cardName")} />
        <input className="input" placeholder={t("cardNumber")} aria-label={t("cardNumber")} inputMode="numeric" />
        <div className="input-row">
          <input className="input" placeholder="MM/YY" aria-label="MM/YY" />
          <input className="input" placeholder="CVC" aria-label="CVC" inputMode="numeric" />
        </div>
      </div>
      <button onClick={onPay} className="btn btn-primary full-w">
        {t("pay", { price: total })}
      </button>
      <p className="checkout-note">{t("demoNote")}</p>
    </ModalShell>
  );
}

// ── Cart Modal ────────────────────────────────────────────────────────────────
export function CartModal({ cart, cartTotal, onRemove, onClose, onCheckout }) {
  const { t } = useTranslation();
  const savings = cart.length > 1 ? cart.length * 99 - cartTotal : 0;
  return (
    <ModalShell onClose={onClose} maxWidth={400} label={t("cart")}>
      <ModalHeader title={`🛒 ${t("cart")}`} onClose={onClose} />
      {cart.length === 0
        ? <p className="caption text-center" style={{ padding: "var(--sp-8) 0" }}>{t("cartEmpty")}</p>
        : <>
          {cart.map(c => (
            <div key={c.id} className="cart-row">
              <span>{c.icon} {c.title}</span>
              <div className="row">
                <strong>99 kr</strong>
                <button onClick={() => onRemove(c.id)} className="btn btn-dark btn-icon btn-sm" aria-label={`${t("remove")} ${c.title}`}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
          <hr className="divider" />
          <div className="cart-total">
            <span>{t("total")}</span>
            <strong className="gradient-text" style={{ fontSize: 20 }}>{cartTotal} kr</strong>
          </div>
          {savings > 0 && (
            <p className="caption text-center" style={{ color: "var(--accent)", marginTop: "var(--sp-2)" }}>
              🎉 {t("bundleDiscount")}
            </p>
          )}
          <button onClick={onCheckout} className="btn btn-primary full-w mt-4">
            {t("checkout")} — {cartTotal} kr
          </button>
        </>}
    </ModalShell>
  );
}
