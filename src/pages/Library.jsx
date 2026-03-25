import { useMemo, useState } from "react";
import { Package, ShoppingCart, ArrowRight, LogIn, User } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { courses, BUNDLE_PRICE, COURSE_PRICE } from "../courses";
import { useLocalStorage } from "../hooks/index";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../i18n/useTranslation";
import { AuthModal, UserMenu } from "../AuthModal";
import { calcStreak } from "../utils/index";

export function Library({ ownedCourses, cart, onBuy, onBuyBundle, onStart, onOpenCart }) {
  const [userName, setUserName] = useLocalStorage("pyc_username", "");
  const { user, isLoggedIn, loading } = useAuth();
  const { t } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const allOwned = ownedCourses.length === courses.length;

  const globalStats = useMemo(() => {
    const totalDays   = courses.reduce((s, c) => s + (JSON.parse(localStorage.getItem(`pyc_completed_${c.id}`) || "[]")).length, 0);
    const bestStreak  = Math.max(0, ...courses.map(c => calcStreak(JSON.parse(localStorage.getItem(`pyc_completed_${c.id}`) || "[]"))));
    const coursesDone = courses.filter(c => (JSON.parse(localStorage.getItem(`pyc_completed_${c.id}`) || "[]")).length === 30).length;
    return { totalDays, bestStreak, coursesDone };
  }, []);

  return (
    <div className="app">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}

      <div className="container">
        {/* Header */}
        <header className="library-header">
          <div>
            <h1 className="display-title">{t("appName")}</h1>
            <p className="caption" style={{ marginTop: 6 }}>{t("tagline")}</p>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            {/* Name input for guests */}
            {!isLoggedIn && !userName && (
              <input
                className="input"
                style={{ maxWidth: 150 }}
                placeholder={t("yourName")}
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
            )}

            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Auth button */}
            {!loading && (
              isLoggedIn ? (
                <button onClick={() => setShowUserMenu(true)} className="btn btn-dark" style={{ gap: 8 }}>
                  <User size={16} />
                  {user?.name?.split(" ")[0]}
                </button>
              ) : (
                <button onClick={() => setShowAuth(true)} className="btn btn-secondary" style={{ gap: 8 }}>
                  <LogIn size={15} /> {t("login")}
                </button>
              )
            )}

            <button onClick={onOpenCart} className="btn btn-dark cart-btn" aria-label={t("cart")}>
              <ShoppingCart size={17} />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
          </div>
        </header>

        {/* Bundle banner */}
        {!allOwned && (
          <section className="bundle-banner animate-fade-in">
            <div>
              <div className="row mb-4">
                <Package size={20} style={{ color: "var(--accent)" }} />
                <strong style={{ fontSize: 17 }}>{t("bundleBanner", { price: BUNDLE_PRICE })}</strong>
                <span className="bundle-save">{t("bundleSave", { amount: courses.length * COURSE_PRICE - BUNDLE_PRICE })}</span>
              </div>
              <p className="caption">{t("bundleDesc")}</p>
            </div>
            <button onClick={onBuyBundle} className="btn btn-primary btn-lg">
              {t("buyAll", { price: BUNDLE_PRICE })} <ArrowRight size={16} />
            </button>
          </section>
        )}

        {/* Stats */}
        {ownedCourses.length > 0 && (
          <section className="stats-banner animate-fade-in">
            {[
              [`${ownedCourses.length}/${courses.length}`, t("ownedCourses")],
              [globalStats.totalDays, t("daysCompleted")],
              [globalStats.bestStreak, t("bestStreak")],
              [globalStats.coursesDone, t("coursesDone")],
            ].map(([val, lbl]) => (
              <div key={lbl} className="card stats-item">
                <div className="stats-val">{val}</div>
                <div className="caption">{lbl}</div>
              </div>
            ))}
          </section>
        )}

        {/* Course grid */}
        <main>
          <h2 className="section-title mb-6">{t("allCourses")}</h2>
          <div className="course-grid">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                owned={ownedCourses.includes(course.id)}
                inCart={!!cart.find(c => c.id === course.id)}
                onBuy={onBuy}
                onStart={onStart}
              />
            ))}
          </div>
        </main>

        {/* Why Code30 */}
        <section>
          <h2 className="section-title text-center mb-6">{t("whyTitle")}</h2>
          <div className="why-grid">
            {[
              ["🎯", t("why1Title"), t("why1Desc")],
              ["💻", t("why2Title"), t("why2Desc")],
              ["🧠", t("why3Title"), t("why3Desc")],
              ["🏆", t("why4Title"), t("why4Desc")],
            ].map(([icon, title, desc]) => (
              <div key={title} className="panel why-card">
                <span className="why-icon">{icon}</span>
                <div>
                  <p className="why-title">{title}</p>
                  <p className="caption" style={{ lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
