import { useState } from "react";
import { X, LogIn, UserPlus, Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useTranslation } from "./i18n/useTranslation";

function Field({ label, type, value, onChange, placeholder, autoComplete, error }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="input"
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={error ? { borderColor: "#ff6060" } : {}}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 0 }}
            aria-label={show ? t("hidePassword") : t("showPassword")}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: "#ff8080" }}>{error}</span>}
    </div>
  );
}

export function AuthModal({ onClose, initialMode = "login" }) {
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode]       = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");

  const switchMode = (m) => {
    setMode(m); setError(""); setFieldErrors({});
    setName(""); setEmail(""); setPassword(""); setConfirm("");
  };

  const validate = () => {
    const errs = {};
    if (mode === "register" && !name.trim()) errs.name = t("errName");
    if (!email.trim()) errs.email = t("errEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("errEmail");
    if (!password) errs.password = t("errPasswordRequired");
    else if (mode === "register" && password.length < 8) errs.password = t("errPassword");
    if (mode === "register" && password !== confirm) errs.confirm = t("errPasswordMatch");
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setError("");
    try {
      if (mode === "login") await login(email.trim(), password);
      else await register(email.trim(), password, name.trim());
      onClose();
    } catch (err) {
      setError(err.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 420 }} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="label mb-4">{mode === "login" ? t("welcomeBack") : t("getStarted")}</p>
            <h2 className="section-title" style={{ fontSize: 22, marginBottom: 0 }}>
              {mode === "login" ? t("loginTab") : t("registerTab")}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-dark btn-icon" aria-label={t("close")}><X size={16} /></button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: "var(--card)", borderRadius: "var(--r-md)", padding: 4, marginBottom: 24, gap: 4 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all var(--t-base)", background: mode === m ? "var(--accent)" : "transparent", color: mode === m ? "#031017" : "var(--text-muted)" }}>
              {m === "login" ? t("loginTab") : t("registerTab")}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <Field label={t("nameLabel")} type="text" value={name} onChange={setName}
              placeholder={t("namePlaceholder")} autoComplete="name" error={fieldErrors.name} />
          )}
          <Field label={t("emailLabel")} type="email" value={email} onChange={setEmail}
            placeholder={t("emailPlaceholder")} autoComplete="email" error={fieldErrors.email} />
          <Field label={t("passwordLabel")} type="password" value={password} onChange={setPassword}
            placeholder={t("passwordPlaceholder")} autoComplete={mode === "login" ? "current-password" : "new-password"} error={fieldErrors.password} />
          {mode === "register" && (
            <Field label={t("confirmPassword")} type="password" value={confirm} onChange={setConfirm}
              placeholder={t("confirmPlaceholder")} autoComplete="new-password" error={fieldErrors.confirm} />
          )}

          {error && (
            <div style={{ background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: "var(--r-md)", padding: "12px 16px", fontSize: 14, color: "#ff9898" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: 4, fontSize: 15, padding: "13px", justifyContent: "center" }}>
            {loading ? t("loading")
              : mode === "login"
                ? <><LogIn size={16} /> {t("loginBtn")}</>
                : <><UserPlus size={16} /> {t("registerBtn")}</>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-dim)" }}>
          {mode === "login" ? t("noAccount") : t("hasAccount")}
          <button onClick={() => switchMode(mode === "login" ? "register" : "login")} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {mode === "login" ? t("createFree") : t("loginTab")}
          </button>
        </p>

        {mode === "login" && (
          <p style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text-dim)", opacity: 0.6 }}>
            {t("freeNote")}
          </p>
        )}
      </div>
    </div>
  );
}

export function UserMenu({ onClose }) {
  const { user, logout, ownedCourses, achievements } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 360 }} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="label mb-4">{t("loggedInAs")}</p>
            <h2 className="section-title" style={{ fontSize: 20, marginBottom: 0 }}>{user?.name}</h2>
            <p className="caption" style={{ marginTop: 4 }}>{user?.email}</p>
          </div>
          <button onClick={onClose} className="btn btn-dark btn-icon"><X size={16} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            [t("ownedCourses"), ownedCourses.length],
            [t("achievements"), achievements.length],
            [t("levelLabel"), Math.max(1, ownedCourses.length * 10)],
          ].map(([label, val]) => (
            <div key={label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", background: "linear-gradient(90deg,var(--accent),var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
              <div className="caption" style={{ fontSize: 11 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onClose} className="btn btn-dark" style={{ width: "100%", justifyContent: "center" }}>{t("close")}</button>
          <button onClick={handleLogout} disabled={loading} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
            {loading ? t("loading") : t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
