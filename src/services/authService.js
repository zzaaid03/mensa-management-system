// authService.js – placeholder for authentication functions
// TODO: Integrate Firebase Auth here. Exported functions are thin wrappers that will be replaced.

export async function login(email, password) {
  // Replace with firebase.auth().signInWithEmailAndPassword or REST call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) return reject(new Error('Missing credentials'));
      return resolve({ uid: 'user_123', email, name: 'Test User' });
    }, 500);
  });
}

export async function register(name, email, password) {
  // Replace with firebase.auth().createUserWithEmailAndPassword and profile update
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password || !name) return reject(new Error('Missing fields'));
      return resolve({ uid: `user_${Date.now()}`, email, name });
    }, 700);
  });
}

export async function signOut() {
  // Replace with firebase.auth().signOut()
  return Promise.resolve();
}

export function getCurrentUser() {
  // Replace with firebase auth state listener
  return null;
}

export default {
  login,
  register,
  signOut,
  getCurrentUser,
};
