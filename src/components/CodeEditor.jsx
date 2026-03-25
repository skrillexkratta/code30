import { useState, useEffect, useRef, useCallback } from "react";
import { Code2, RotateCcw, EyeOff } from "lucide-react";
import { CopyButton } from "./UI";

export function CodeEditor({ starterCode, lang }) {
  const [code, setCode]         = useState(starterCode);
  const [output, setOutput]     = useState("");
  const [running, setRunning]   = useState(false);
  const [pyStatus, setPyStatus] = useState("idle");
  const [htmlPreview, setHtmlPreview] = useState(false);
  const pyRef     = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => { setCode(starterCode); setOutput(""); setHtmlPreview(false); }, [starterCode]);

  // Update iframe AFTER it mounts — use a callback ref instead of useRef
  const iframeCallback = useCallback((iframe) => {
    if (!iframe || lang !== "html") return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) { doc.open(); doc.write(code); doc.close(); }
    } catch {}
  }, [code, lang]); // re-runs when code changes while preview is open

  const loadPyodide = useCallback(async () => {
    if (lang !== "python") return;
    if (pyRef.current) { setPyStatus("ready"); return; }
    if (loadedRef.current) return;
    loadedRef.current = true;
    setPyStatus("loading");
    try {
      if (!window._pyodideScript) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
          window._pyodideScript = s;
        });
      }
      if (window._pyodideInstance) { pyRef.current = window._pyodideInstance; }
      else {
        const py = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" });
        window._pyodideInstance = py;
        pyRef.current = py;
      }
      setPyStatus("ready");
    } catch {
      setPyStatus("error");
      loadedRef.current = false;
    }
  }, [lang]);

  const run = async () => {
    setRunning(true); setOutput("");

    if (lang === "html") {
      setHtmlPreview(true);
      setRunning(false);
      return;
    }

    if (lang === "python") {
      if (!pyRef.current) { setOutput("⏳ Python laddas… försök igen om ett ögonblick."); setRunning(false); return; }
      try {
        let out = "";
        pyRef.current.setStdout({ batched: s => { out += s + "\n"; } });
        await pyRef.current.runPythonAsync(code.replace(/input\s*\([^)]*\)/g, '"[simulerad input]"'));
        setOutput(out || "(Ingen output)");
      } catch (e) { setOutput("❌ " + e.message); }

    } else if (lang === "javascript") {
      try {
        const logs = [];
        const orig = console.log;
        console.log = (...args) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
        // eslint-disable-next-line no-new-func
        new Function(code.replace(/^import .+$/gm, "// import removed").replace(/^export /gm, ""))();
        console.log = orig;
        setOutput(logs.join("\n") || "(Ingen output)");
      } catch (e) { setOutput("❌ " + e.message); }

    } else if (lang === "sql") {
      setOutput("🗄️ SQL körs mot en riktig databas — testa koden i:\n\n• sqliteonline.com  (gratis, direkt i webbläsaren)\n• db-fiddle.com\n• Din lokala MySQL / PostgreSQL");

    } else {
      setOutput("💡 Kopiera koden och testa i ett externt verktyg.");
    }
    setRunning(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = e.target.selectionStart;
      setCode(v => v.substring(0, s) + "    " + v.substring(e.target.selectionEnd));
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; }, 0);
    }
  };

  const pyNotReady = lang === "python" && pyStatus !== "ready";
  const isHtml = lang === "html";

  return (
    <div className="editor-wrap">
      <div className="editor-toolbar">
        <div className="row">
          <div className="editor-lang-dot" />
          <Code2 size={13} style={{ color: "var(--accent)", opacity: .7 }} />
          <span className="caption">{lang}</span>
          {lang === "python" && pyStatus === "loading" && <span className="caption" style={{ color: "#ff8fe9" }}>· Laddar Python…</span>}
          {lang === "python" && pyStatus === "error"   && <span className="caption" style={{ color: "#ff6060" }}>· Laddningsfel</span>}
          {isHtml && htmlPreview && <span className="caption" style={{ color: "#78ffb4" }}>· Live-förhandsgranskning</span>}
        </div>
        <div className="row">
          {isHtml && htmlPreview && (
            <button onClick={() => setHtmlPreview(false)} className="btn-copy" aria-label="Stäng förhandsgranskning">
              <EyeOff size={13} /> Stäng
            </button>
          )}
          <CopyButton text={code} />
          <button
            onClick={() => { setCode(starterCode); setOutput(""); setHtmlPreview(false); }}
            className="btn-copy"
            aria-label="Återställ kod"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* HTML live preview — callback ref ensures iframe is in DOM before writing */}
      {isHtml && htmlPreview ? (
        <iframe
          ref={iframeCallback}
          title="HTML-förhandsgranskning"
          style={{ width: "100%", minHeight: 280, border: "none", background: "#fff", display: "block" }}
          sandbox="allow-scripts"
        />
      ) : (
        <textarea
          className="code-textarea"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => lang === "python" && pyStatus === "idle" && loadPyodide()}
          spellCheck={false}
          rows={Math.max(4, code.split("\n").length + 1)}
          aria-label="Kodeditor"
        />
      )}

      <button
        onClick={run}
        disabled={running || (pyNotReady && pyStatus !== "idle")}
        className="btn btn-primary btn-run"
        aria-busy={running}
      >
        {running            ? "⏳ Kör…"
          : pyNotReady && pyStatus === "loading" ? "⏳ Laddar Python…"
          : isHtml          ? "👁 Förhandsgranska HTML"
          : "▶ Kör kod"}
      </button>

      {output && (
        <div className="output-box" aria-live="polite">
          <p className="caption mb-4">Output</p>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}
