// Google sign-in and admin check for Chhaya Toru.
// The browser check only controls what the UI shows.
// Real write protection is enforced by Firestore Security Rules.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

export function logout() {
  return signOut(auth);
}

// Calls cb(user) whenever the sign-in state changes
export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// A user is an admin only if admins/{email} exists in Firestore.
// The document ID is the admin's Gmail address, so no UID lookup is needed.
export async function isAdmin(user) {
  if (!user || !user.email) return false;
  const snap = await getDoc(doc(db, "admins", user.email.toLowerCase()));
  return snap.exists();
}
