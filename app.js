import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  fetchSignInMethodsForEmail, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// --- CONFIGURATION ---
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

// --- LOGIQUE DOM ---
const authSection = document.getElementById("auth-section");
const userSection = document.getElementById("user-section");
const userEmailDisplay = document.getElementById("user-email");

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

// --- UTILITAIRES ---
function getAuthErrorMessage(error) {
  const map = {
    "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/email-already-in-use": "Cet email est déjà utilisé.",
    "auth/user-not-found": "Ce compte n'existe pas.",
    "auth/invalid-login-credentials": "Identifiants de connexion invalides.",
  };
  return map[error?.code] || error.message || "Erreur inconnue.";
}

function showFormError(element, message) {
  element.textContent = message;
  element.classList.remove("hidden");
}

function clearFormError(element) {
  element.textContent = "";
  element.classList.add("hidden");
}

function formatTimestamp(ts) {
  if (!ts || typeof ts.toDate !== "function") return "À l'instant";
  return ts.toDate().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add("hidden");
    userSection.classList.remove("hidden");
    userEmailDisplay.textContent = user.email;
    loadMessages(); 
  } else {
    authSection.classList.remove("hidden");
    userSection.classList.add("hidden");
    userEmailDisplay.textContent = "";
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFormError(signupError);
  try {
    await createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value);
    signupForm.reset();
  } catch (error) {
    showFormError(signupError, getAuthErrorMessage(error));
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFormError(loginError);
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    loginForm.reset();
  } catch (error) {
    showFormError(loginError, getAuthErrorMessage(error));
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).catch((err) => alert(err.message));
});

messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = messageInput.value.trim();
  const user = auth.currentUser;

  if (!content || !user) return;

  try {
    await addDoc(collection(db, "messages"), {
      content: content,
      uid: user.uid,
      email: user.email, // 
      createdAt: serverTimestamp(),  
    });
    messageForm.reset();
  } catch (error) {
    console.error("Erreur d'envoi:", error);
    alert("Impossible d'envoyer le message.");
  }
});

function loadMessages() {
  const messagesRef = collection(db, "messages");
  
onSnapshot(messagesRef, (snapshot) => {
    messagesDiv.innerHTML = "";
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    messages.sort((a, b) => {
      const tA = a.createdAt?.seconds || a.timestamp?.seconds || 0;
      const tB = b.createdAt?.seconds || b.timestamp?.seconds || 0;
      return tB - tA;
    });

    messages.forEach(msg => {
      const el = document.createElement("div");
      el.className = "message";
      
      const dateObj = msg.createdAt || msg.timestamp;

      const meta = document.createElement("p");
      meta.className = "message-meta";
      meta.textContent = `${msg.email} • ${formatTimestamp(dateObj)}`;

      const text = document.createElement("p");
      text.textContent = msg.content;

      el.appendChild(meta);
      el.appendChild(text);
      messagesDiv.appendChild(el);
    });
  });
}