// Google sign-in and admin check for Chhaya Toru.
// The browser check only controls what the UI shows.
// Real write protection is enforced by Firestore Security Rules.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// Opens the Google account picker and returns the signed-in user
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Email and password sign-in (the admin's own username and password)
export async function loginWithPassword(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export function logout() {
  return signOut(auth);
}

// Calls cb(user) whenever the sign-in state changes
export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// Any account you add in Firebase Console → Authentication → Users is an admin.
// There is no separate list to maintain.
export async function isAdmin(user) {
  return !!(user && user.email);
}