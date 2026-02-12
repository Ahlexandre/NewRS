import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import AuthService from "./services/AuthService.js";
import FirestoreWriteService from "./services/FirestoreWriteService.js";
import FirestoreReadService from "./services/FirestoreReadService.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-H0wdOizgO9RX4PaqL994-DPdkfqLeTs",
  authDomain: "newrs-f46d8.firebaseapp.com",
  projectId: "newrs-f46d8",
  storageBucket: "newrs-f46d8.firebasestorage.app",
  messagingSenderId: "2526469764",
  appId: "1:2526469764:web:c700965526c79833a4ecd1",
  measurementId: "G-N4TFWQ0ETP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authService = new AuthService(auth);
const firestoreWriteService = new FirestoreWriteService(db);
const firestoreReadService = new FirestoreReadService(db);

const authSection = document.getElementById("auth-section");
const userSection = document.getElementById("user-section");
const userEmail = document.getElementById("user-email");

const signupForm = document.getElementById("signup-form");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupError = document.getElementById("signup-error");

const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");

const logoutBtn = document.getElementById("logout");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messagesDiv = document.getElementById("messages");

function showError(error) {
  alert(error.message || "Une erreur est survenue.");
}

function getAuthErrorMessage(error) {
  const map = {
    "auth/invalid-email": "Adresse email invalide.",
    "auth/missing-password": "Le mot de passe est obligatoire.",
    "auth/weak-password": "Le mot de passe doit contenir au moins 6 caracteres.",
    "auth/email-already-in-use": "Cet email est deja utilise.",
    "auth/user-not-found": "Ce compte n'existe pas.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Mot de passe incorrect.",
    "auth/invalid-login-credentials": "Mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Reessaye plus tard."
  };

  return map[error?.code] || "Impossible de traiter la demande pour le moment.";
}

function showFormError(element, message) {
  element.textContent = message;
  element.classList.remove("hidden");
}

function clearFormError(element) {
  element.textContent = "";
  element.classList.add("hidden");
}

function formatTimestamp(createdAt) {
  if (!createdAt || typeof createdAt.toDate !== "function") {
    return "Envoi en cours...";
  }

  return createdAt.toDate().toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

signupForm.addEventListener("submit", async event => {
  event.preventDefault();
  clearFormError(signupError);

  try {
    await authService.signup(signupEmail.value.trim(), signupPassword.value);
    signupForm.reset();
  } catch (error) {
    showFormError(signupError, getAuthErrorMessage(error));
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  clearFormError(loginError);
  const email = loginEmail.value.trim().toLowerCase();

  try {
    const accountExists = await authService.accountExists(email);
    if (!accountExists) {
      showFormError(loginError, "Ce compte n'existe pas.");
      return;
    }

    await authService.login(email, loginPassword.value);
    loginForm.reset();
  } catch (error) {
    showFormError(loginError, getAuthErrorMessage(error));
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await authService.logout();
  } catch (error) {
    showError(error);
  }
});

authService.onAuthChange(user => {
  if (user) {
    authSection.classList.add("hidden");
    userSection.classList.remove("hidden");
    userEmail.textContent = user.email || "Utilisateur";
    return;
  }

  authSection.classList.remove("hidden");
  userSection.classList.add("hidden");
  userEmail.textContent = "";
});

messageForm.addEventListener("submit", async event => {
  event.preventDefault();

  const user = authService.getCurrentUser();
  if (!user) {
    alert("Tu dois etre connecte pour publier.");
    return;
  }

  try {
    await firestoreWriteService.createMessage(messageInput.value, user);
    messageForm.reset();
  } catch (error) {
    showError(error);
  }
});

firestoreReadService.subscribeToMessages(
  messages => {
    messagesDiv.innerHTML = "";

    messages.forEach(message => {
      const wrapper = document.createElement("div");
      wrapper.className = "message";

      const meta = document.createElement("p");
      meta.className = "message-meta";
      meta.textContent = `${message.email || "Inconnu"} - ${formatTimestamp(message.createdAt || message.timestamp)}`;

      const content = document.createElement("p");
      content.textContent = message.content || "";

      wrapper.append(meta, content);
      messagesDiv.appendChild(wrapper);
    });
  },
  error => {
    showError(error);
  }
);
