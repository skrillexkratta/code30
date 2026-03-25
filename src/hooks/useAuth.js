import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { authApi, progressApi } from "./useApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [progress, setProgress]       = useState({});
  const [ownedCourses, setOwned]      = useState([]);
  const [achievements, setAchievements] = useState([]);

  const loadProgress = useCallback(async () => {
    try {
      const data = await progressApi.getAll();
      setProgress(data.progress     || {});
      setOwned(data.ownedCourses    || []);
      setAchievements(data.achievements || []);
    } catch {}
  }, []);

  // Single source of truth: Firebase onAuthStateChanged
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid)).catch(() => null);
        const data = snap?.exists() ? snap.data() : {};
        setUser({
          id:    firebaseUser.uid,
          email: firebaseUser.email,
          name:  data.name || firebaseUser.email,
          role:  data.role || "user",
        });
        try {
          const pData = await progressApi.getAll();
          setProgress(pData.progress     || {});
          setOwned(pData.ownedCourses    || []);
          setAchievements(pData.achievements || []);
        } catch {}
      } else {
        setUser(null);
        setProgress({});
        setOwned([]);
        setAchievements([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authApi.login(email, password);
    setUser(u);
    await loadProgress();
    return u;
  }, [loadProgress]);

  const register = useCallback(async (email, password, name) => {
    const u = await authApi.register(email, password, name);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setProgress({});
    setOwned([]);
    setAchievements([]);
  }, []);

  const completeDay = useCallback(async (courseId, day) => {
    const result = await progressApi.completeDay(courseId, day);
    setProgress(prev => {
      const days = prev[courseId] || [];
      if (days.includes(day)) return prev;
      return { ...prev, [courseId]: [...days, day].sort((a, b) => a - b) };
    });
    if (result.newAchievements?.length) {
      setAchievements(prev => [...prev, ...result.newAchievements.map(a => a.id)]);
    }
    return result;
  }, []);

  const uncompleteDay = useCallback(async (courseId, day) => {
    await progressApi.uncompleteDay(courseId, day);
    setProgress(prev => ({
      ...prev,
      [courseId]: (prev[courseId] || []).filter(d => d !== day),
    }));
  }, []);

  const unlockCourse = useCallback(async (courseId) => {
    const result = await progressApi.unlockCourse(courseId);
    setOwned(prev => [...new Set([...prev, courseId])]);
    if (result.newAchievements?.length) {
      setAchievements(prev => [...prev, ...result.newAchievements.map(a => a.id)]);
    }
    return result;
  }, []);

  const value = {
    user, loading,
    progress, ownedCourses, achievements,
    isLoggedIn: !!user,
    isAdmin:    user?.role === "admin",
    login, register, logout,
    completeDay, uncompleteDay, unlockCourse,
    loadProgress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
