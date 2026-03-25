// ── src/hooks/useApi.js ────────────────────────────────────────────────────────
// Firebase Auth + Firestore implementation
// Keeps the same authApi / progressApi interface so useAuth.js needs no changes.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  async register(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      name,
      purchasedPrograms: [],
      createdAt: serverTimestamp(),
    });
    return { id: cred.user.uid, email, name, role: "user" };
  },

  async login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const data = snap.exists() ? snap.data() : {};
    return {
      id:    cred.user.uid,
      email: cred.user.email,
      name:  data.name  || email,
      role:  data.role  || "user",
    };
  },

  async logout() {
    await signOut(auth);
  },

  async me() {
    const user = auth.currentUser;
    if (!user) return null;
    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.exists() ? snap.data() : {};
    return {
      id:    user.uid,
      email: user.email,
      name:  data.name || user.email,
      role:  data.role || "user",
    };
  },

  // Not used anymore — useAuth.js uses onAuthStateChanged directly.
  // Kept here for interface compatibility.
  async restoreSession() { return null; },

  async updateName(name) {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { name });
  },
};

// ── Progress API ──────────────────────────────────────────────────────────────
export const progressApi = {
  async getAll() {
    const user = auth.currentUser;
    if (!user) return { progress: {}, ownedCourses: [], achievements: [] };

    const [progressSnap, userSnap] = await Promise.all([
      getDoc(doc(db, "progress", user.uid)),
      getDoc(doc(db, "users",    user.uid)),
    ]);

    return {
      progress:     progressSnap.exists() ? (progressSnap.data().courses || {}) : {},
      ownedCourses: userSnap.exists()     ? (userSnap.data().purchasedPrograms || []) : [],
      achievements: [],
    };
  },

  async completeDay(courseId, day) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const ref  = doc(db, "progress", user.uid);
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data().courses || {}) : {};
    const days    = current[courseId] || [];

    if (!days.includes(day)) {
      await setDoc(ref, {
        courses: { ...current, [courseId]: [...days, day].sort((a, b) => a - b) },
      }, { merge: true });
    }
    return { newAchievements: [] };
  },

  async uncompleteDay(courseId, day) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const ref  = doc(db, "progress", user.uid);
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data().courses || {}) : {};
    const days    = (current[courseId] || []).filter(d => d !== day);

    await setDoc(ref, {
      courses: { ...current, [courseId]: days },
    }, { merge: true });
  },

  async unlockCourse(courseId) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    await updateDoc(doc(db, "users", user.uid), {
      purchasedPrograms: arrayUnion(courseId),
    });
    return { newAchievements: [] };
  },
};

// ── Stub exports kept for import compatibility ─────────────────────────────────
export const achievementsApi = { async getAll() { return []; } };
export const adminApi        = { async getStats() { return {}; }, async getUsers() { return {}; } };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
