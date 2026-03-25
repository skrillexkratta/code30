import { useState, useEffect } from "react";
import { LandingPage }  from "./pages/LandingPage";
import { Dashboard }    from "./pages/Dashboard";
import { CourseView }   from "./pages/CourseView";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { LanguageProvider }      from "./i18n/useTranslation";
import { aiCourses, PROGRAM_ID } from "./aiProgram";
import "./App.css";

function AppInner() {
  const { isLoggedIn, loading, ownedCourses, user, loadProgress } = useAuth();
  const [screen,        setScreen]        = useState("landing");
  const [activeCourseId, setActiveCourseId] = useState(null);

  // Handle Stripe success redirect (?payment=success)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      // Reload progress — webhook may have unlocked the program
      loadProgress().finally(() => setScreen("dashboard"));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // After login, go to dashboard automatically
  useEffect(() => {
    if (!loading && isLoggedIn && screen === "landing") {
      // Only auto-navigate if they came from a login (session restore keeps them on landing)
    }
  }, [isLoggedIn, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stripe checkout ────────────────────────────────────────────────────────
  const handleGetAccess = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: user?.id, userEmail: user?.email }),
      });
      const { url, error } = await res.json();
      if (error) { alert(error); return; }
      if (url) window.location.href = url;
    } catch {
      alert("Could not start checkout. Please try again.");
    }
  };

  // ── Routing ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)", color: "var(--text-muted)", fontSize: 15,
      }}>
        Loading…
      </div>
    );
  }

  // Course view
  if (screen === "course" && activeCourseId) {
    const course = aiCourses.find(c => c.id === activeCourseId);
    if (!course) { setScreen("dashboard"); return null; }

    return (
      <CourseView
        course={course}
        owned={ownedCourses.includes(PROGRAM_ID) || ownedCourses.length > 0}
        userName={user?.name || ""}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  // Dashboard (requires login)
  if (screen === "dashboard") {
    if (!isLoggedIn) { setScreen("landing"); return null; }
    return (
      <Dashboard
        onStartModule={(id) => { setActiveCourseId(id); setScreen("course"); }}
        onGoToLanding={() => setScreen("landing")}
      />
    );
  }

  // Landing page (default)
  return (
    <LandingPage
      onGetAccess={handleGetAccess}
      onGoToDashboard={() => setScreen(isLoggedIn ? "dashboard" : "landing")}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LanguageProvider>
  );
}
