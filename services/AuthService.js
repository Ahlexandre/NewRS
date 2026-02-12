import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

export default class AuthService {
  constructor(auth) {
    this.auth = auth;
  }

  signup(email, password) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async accountExists(email) {
    const methods = await fetchSignInMethodsForEmail(this.auth, email);
    return methods.length > 0;
  }

  logout() {
    return signOut(this.auth);
  }

  onAuthChange(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}
