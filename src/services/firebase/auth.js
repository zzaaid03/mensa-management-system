import { auth, db } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// REGISTER a new user
export async function signUp(name, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: name,
    email: email,
    role: "student",
    createdAt: new Date().toISOString()
  });

  return user;
}

// LOGIN existing user
export async function signIn(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// LOGOUT
export async function logOut() {
  await signOut(auth);
}

// PASSWORD RESET
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// CHECK WHO IS LOGGED IN
export function getCurrentUser(callback) {
  return onAuthStateChanged(auth, callback);
}