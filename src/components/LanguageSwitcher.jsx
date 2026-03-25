import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";

export function LanguageSwitcher() {
  const { lang, setLang, languages } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find(l => l.code === lang) || languages[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-dark"
        style={{ gap: 6, minWidth: 0, padding: "8px 12px", fontSize: 14 }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Språk: ${current.label}`}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{current.code.toUpperCase()}</span>
        <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Välj språk"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 200,
            minWidth: 140,
          }}
        >
          {languages.map(l => (
            <button
              key={l.code}
              role="option"
              aria-selected={lang === l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 16px",
                background: lang === l.code ? "rgba(87,246,255,0.08)" : "transparent",
                border: "none",
                cursor: "pointer",
                color: lang === l.code ? "var(--accent)" : "var(--text)",
                fontSize: 14,
                fontWeight: lang === l.code ? 700 : 400,
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = lang === l.code ? "rgba(87,246,255,0.08)" : "transparent"}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
