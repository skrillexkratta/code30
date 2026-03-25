import { ChevronRight, CheckCircle } from "lucide-react";
import { ProgressBar } from "./UI";
import { useLocalStorage } from "../hooks/index";
import { useTranslation } from "../i18n/useTranslation";
import { getLessons } from "../courses";

export function CourseCard({ course, owned, inCart, onBuy, onStart }) {
  const { t, lang } = useTranslation();
  const lessons = getLessons(course, lang);
  const [completedDays] = useLocalStorage(`pyc_completed_${course.id}`, []);
  const progress = Math.round((completedDays.length / lessons.length) * 100);
  const nextDay  = lessons.find(d => !completedDays.includes(d.day));

  return (
    <article
      className="course-card panel animate-up"
      aria-label={`${course.title}${owned ? ", owned" : ""}`}
      style={{ "--course-accent": course.accent }}
    >
      {/* Top row */}
      <div className="course-card-top">
        <span className="course-icon" aria-hidden="true">{course.icon}</span>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <h3 className="course-title">{course.title}</h3>
          <p className="course-tagline">
            {lang === "en" && course.tagline_en ? course.tagline_en
              : lang === "es" && course.tagline_es ? course.tagline_es
              : course.tagline}
          </p>
        </div>
        {owned
          ? <span className="owned-badge">✓ {t("owned")}</span>
          : <span className="free-badge">{t("dayLabel", { n: 1 })} {t("free")}</span>}
      </div>

      {/* Feature tags */}
      <div className="feature-tags">
        {["30 days", "Quiz", "Code editor", "Certificate"].map(f => (
          <span key={f} className="feature-tag">{f}</span>
        ))}
      </div>

      {/* Progress (if owned) */}
      {owned && (
        <div className="mb-5">
          <div className="row between mb-4">
            <span className="caption">{t("progressLabel")}</span>
            <span className="caption" style={{ color: "var(--cyan)", fontWeight: 700 }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          {nextDay && (
            <p className="caption mt-4" style={{ color: "var(--cyan)", opacity: 0.8, fontSize: 12 }}>
              → {t("dayLabel", { n: nextDay.day })} — {nextDay.title}
            </p>
          )}
        </div>
      )}

      <div className="course-spacer" />

      {/* Action buttons */}
      <div className="btn-row mt-4">
        {owned ? (
          <button
            onClick={() => onStart(course)}
            className="btn btn-primary flex-1"
            style={{ background: course.accent, color: "#030810" }}
          >
            {completedDays.length > 0 ? t("continueCourse") : t("startCourse")}
            <ChevronRight size={15} />
          </button>
        ) : (
          <>
            <button onClick={() => onStart(course)} className="btn btn-ghost flex-1">
              {t("startCourse")}
            </button>
            <button
              onClick={() => onBuy(course)}
              className={`btn flex-1 ${inCart ? "btn-secondary" : "btn-primary"}`}
              style={inCart ? {} : { background: course.accent, color: "#030810" }}
              aria-label={inCart ? `${course.title} in cart` : `Buy ${course.title}`}
            >
              {inCart ? <><CheckCircle size={13} /> {t("addToCart")}</> : t("buyCourse", { price: 99 })}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
