import { useState, useEffect, useRef } from "react";

export function ProgressBar({ value = 0 }) {
  return (
    <div className="progress-wrap" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={copy} className={`btn-copy ${copied ? "btn-copy--done" : ""}`} aria-label="Copy code">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export function FocusTrap({ children, active }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0], last = focusable[focusable.length - 1];
    const handler = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    el.addEventListener("keydown", handler);
    setTimeout(() => first?.focus(), 50);
    return () => el.removeEventListener("keydown", handler);
  }, [active]);
  return <div ref={ref}>{children}</div>;
}
