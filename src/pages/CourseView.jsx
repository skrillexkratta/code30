import { useState, useMemo, useCallback } from "react";
import {
  Award, BookOpen, CheckCircle2, Flame, Lock,
  PlayCircle, ArrowRight,
} from "lucide-react";
import { ProgressBar } from "../components/UI";
import { CodeEditor }  from "../components/CodeEditor";
import { QuizModal, CertificateModal } from "../modals/index";
import { useLocalStorage, useModal } from "../hooks/index";
import { useTranslation } from "../i18n/useTranslation";
import { calcStreak } from "../utils/index";
import { getLessons } from "../courses";

const FREE_DAYS = [1];

export function CourseView({ course, owned, userName, onBack }) {
  const { t, lang } = useTranslation();
  const lessons = getLessons(course, lang);
  const LS_KEY = `pyc_completed_${course.id}`;
  const [completedDays, setCompletedDays] = useLocalStorage(LS_KEY, []);
  const [selectedDay, setSelectedDay] = useState(() => {
    const next = lessons.find(d => !completedDays.includes(d.day));
    return next ? next.day : lessons[lessons.length - 1].day;
  });
  const [justCompleted, setJustCompleted] = useState(null);

  const quizModal = useModal();
  const certModal = useModal();

  const currentLesson = useMemo(
    () => lessons.find(d => d.day === selectedDay) || lessons[0],
    [selectedDay, course]
  );

  const progress = Math.round((completedDays.length / lessons.length) * 100);
  const streak   = useMemo(() => calcStreak(completedDays), [completedDays]);
  const allDone  = completedDays.length === lessons.length;

  const isDayAccessible = useCallback((day) => {
    if (FREE_DAYS.includes(day)) return true;
    if (owned) return true;
    return false;
  }, [owned]);

  const markComplete = useCallback((day) => {
    setCompletedDays(prev => {
      if (prev.includes(day)) return prev;
      const next = [...prev, day].sort((a, b) => a - b);
      setJustCompleted(day);
      setTimeout(() => setJustCompleted(null), 2200);
      const nextLesson = lessons.find(l => l.day > day);
      if (nextLesson && isDayAccessible(nextLesson.day)) {
        setTimeout(() => setSelectedDay(nextLesson.day), 650);
      }
      return next;
    });
  }, [setCompletedDays, course, isDayAccessible]);

  const isDone       = completedDays.includes(currentLesson.day);
  const isAccessible = isDayAccessible(currentLesson.day);
  const resumeLesson = lessons.find(d => !completedDays.includes(d.day));

  return (
    <>
      {quizModal.isOpen && (
        <QuizModal
          lesson={currentLesson}
          onClose={quizModal.close}
          onPass={() => markComplete(currentLesson.day)}
        />
      )}
      {certModal.isOpen && (
        <CertificateModal
          userName={userName}
          course={course}
          onClose={certModal.close}
        />
      )}

      <div className="app">
        <div className="container">
          {/* Header */}
          <div className="viewer-header">
            <div className="row">
              <button onClick={onBack} className="btn btn-dark btn-sm">← {t("allCourses")}</button>
              <div>
                <p className="label">{t("allCourses")}</p>
                <h1 className="section-title" style={{ fontSize: 24, marginBottom: 0 }}>
                  {course.icon} {course.title}
                </h1>
              </div>
            </div>
            <div className="row">
              {allDone && (
                <button onClick={certModal.open} className="btn btn-primary">
                  <Award size={14} /> {t("certificate")}
                </button>
              )}
            </div>
          </div>

          {/* All-done banner */}
          {allDone && (
            <div className="alert row between mb-6" style={{ background: "rgba(87,246,255,.08)", borderColor: "rgba(87,246,255,.28)" }}>
              <div>
                <strong>🎉 {t("completed")}!</strong>
                <p className="caption mt-4">{t("certCongrats")} {t("certDownload").toLowerCase()} {t("certTitle").toLowerCase()}</p>
              </div>
              <button onClick={certModal.open} className="btn btn-primary btn-sm shrink-0">
                <Award size={13} /> {t("certificate")}
              </button>
            </div>
          )}

          {/* Resume banner */}
          {!allDone && completedDays.length > 0 && resumeLesson && resumeLesson.day !== selectedDay && (
            <div className="resume-banner mb-6">
              <div>
                <p className="label">{t("resume")}</p>
                <p className="caption mt-4">{t("dayLabel", { n: resumeLesson.day })} — {resumeLesson.title}</p>
              </div>
              <button
                onClick={() => setSelectedDay(resumeLesson.day)}
                className="btn btn-primary btn-sm shrink-0"
              >
                {t("resume")} <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Main grid */}
          <div className="viewer-grid">
            {/* Sidebar */}
            <aside className="sidebar-panel">
              {/* Stats */}
              <div className="panel">
                <div className="row between mb-5">
                  <div>
                    <p className="label">{t("progressLabel")}</p>
                    <p className="caption mt-4">{course.tagline}</p>
                  </div>
                  {owned
                    ? <span className="owned-badge">{t("owned")}</span>
                    : <span className="free-badge">{t("free")} {t("dayLabel", { n: 1 })}</span>}
                </div>
                <div className="row between mb-4">
                  <span className="caption">{t("progressLabel")}</span>
                  <span className="caption">{progress}%</span>
                </div>
                <ProgressBar value={progress} />
                <div className="stats-grid mt-4">
                  <div className="card stats-grid-item">
                    <span className="label">{t("daysLabel")}</span>
                    <strong>{completedDays.length}/{lessons.length}</strong>
                  </div>
                  <div className="card stats-grid-item">
                    <span className="label">{t("streakLabel")}</span>
                    <strong className="row" style={{ gap: 4 }}>
                      <Flame size={13} style={{ color: "#ff7c3a" }} />{streak}
                    </strong>
                  </div>
                  <div className="card stats-grid-item">
                    <span className="label">{t("levelLabel")}</span>
                    <strong>{Math.max(1, completedDays.length)}</strong>
                  </div>
                </div>
              </div>

              {/* Lesson list */}
              <div className="panel" style={{ flex: 1 }}>
                <div className="row mb-5">
                  <BookOpen size={15} style={{ color: course.accent }} />
                  <h2 className="section-title" style={{ fontSize: 16, marginBottom: 0 }}>{t("lesson")}er</h2>
                </div>
                <nav className="lesson-list" aria-label={t("lesson") + "er"}>
                  {lessons.map(lesson => {
                    const accessible = isDayAccessible(lesson.day);
                    const done       = completedDays.includes(lesson.day);
                    const sel        = selectedDay === lesson.day;
                    const isFree     = FREE_DAYS.includes(lesson.day);
                    let cls = "lesson-item";
                    if (sel)                           cls += " is-selected";
                    if (done)                          cls += " is-completed";
                    if (!accessible)                   cls += " is-locked";
                    if (justCompleted === lesson.day)  cls += " is-celebrating";
                    if (isFree && !owned)              cls += " is-free-preview";

                    return (
                      <button
                        key={lesson.day}
                        className={cls}
                        onClick={() => accessible && setSelectedDay(lesson.day)}
                        aria-current={sel ? "true" : undefined}
                        aria-disabled={!accessible}
                        tabIndex={accessible ? 0 : -1}
                        title={!accessible ? t("lockedDay") : undefined}
                      >
                        <div className="lesson-item-inner">
                          <div className="lesson-meta">
                            <div className="lesson-day">{t("dayLabel", { n: lesson.day })}</div>
                            <div className="lesson-name">{lesson.title}</div>
                            <div className="lesson-goal-text">{lesson.goal}</div>
                          </div>
                          <div className="lesson-status">
                            {!accessible
                              ? <Lock size={13} style={{ opacity: .5 }} />
                              : done
                                ? <CheckCircle2 size={14} style={{ color: course.accent }} />
                                : <PlayCircle size={14} style={{ opacity: .35 }} />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="content-col" style={{ gridColumn: "span 2" }}>
              {!isAccessible ? (
                <div className="panel locked-card">
                  <Lock size={36} style={{ color: "var(--accent)", opacity: .4 }} />
                  <div>
                    <h2 className="section-title text-center" style={{ marginBottom: 8 }}>
                      {t("dayLabel", { n: currentLesson.day })} — {t("lockedDay")}
                    </h2>
                    <p className="caption text-center">{t("lockedDesc", { price: 99 })}</p>
                  </div>
                  <button
                    onClick={onBack}
                    className="btn btn-primary"
                    style={{ background: course.accent }}
                  >
                    {t("buyUnlock")} <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="panel">
                    <div className="row between mb-5">
                      <div>
                        <p className="label">{t("dayLabel", { n: currentLesson.day })}</p>
                        <h2 className="section-title" style={{ fontSize: 20, marginBottom: 0 }}>
                          {currentLesson.title}
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          if (isDone) {
                            setCompletedDays(p => p.filter(d => d !== currentLesson.day));
                          } else {
                            quizModal.open();
                          }
                        }}
                        className={`btn shrink-0 ${isDone ? "btn-secondary" : "btn-primary"}`}
                        style={isDone ? {} : { background: course.accent }}
                      >
                        {isDone ? t("markUndone") : t("takeQuiz")}
                      </button>
                    </div>

                    <div className="detail-stack">
                      <div className="card">
                        <p className="label mb-4">{t("goal")}</p>
                        <p style={{ margin: 0, lineHeight: 1.65 }}>{currentLesson.goal}</p>
                      </div>
                      <div className="card">
                        <p className="label mb-4">{t("lesson")}</p>
                        <p style={{ margin: 0, lineHeight: 1.65 }}>{currentLesson.lesson}</p>
                      </div>
                      <div className="card">
                        <p className="label mb-4">{t("challenge")}</p>
                        <p style={{ margin: 0, lineHeight: 1.65 }}>{currentLesson.challenge}</p>
                      </div>
                    </div>
                  </div>

                  <CodeEditor starterCode={currentLesson.code} lang={course.lang} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
