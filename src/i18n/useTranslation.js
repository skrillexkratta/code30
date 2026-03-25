import { createContext, useContext, useState, useCallback } from "react";
import { translations, LANGUAGES } from "./translations";

// ── Context ───────────────────────────────────────────────────────────────────
const LangContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("c30_lang") || "sv"
  );

  const setLang = useCallback((code) => {
    localStorage.setItem("c30_lang", code);
    setLangState(code);
    // Update html lang attribute for accessibility
    document.documentElement.lang = code;
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useTranslation() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useTranslation must be used inside <LanguageProvider>");

  const { lang, setLang } = ctx;
  const strings = translations[lang] || translations.sv;

  // t("key") — simple lookup
  // t("key", { n: 5, price: 99 }) — with interpolation
  const t = useCallback((key, vars = {}) => {
    let str = strings[key];
    if (!str) {
      // Fallback to Swedish
      str = translations.sv[key] || key;
    }
    // Replace {variable} placeholders
    return str.replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] !== undefined ? vars[k] : `{${k}}`
    );
  }, [strings]);

  return { t, lang, setLang, languages: LANGUAGES };
}
