import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// DOM elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("message");
const dashboard = document.getElementById("dashboard");
const authBox = document.querySelector(".auth-box");
const userEmail = document.getElementById("userEmail");

// Register new user
registerBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) {
    message.innerText = "Please enter both email and password.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    message.style.color = "green";
    message.innerText = "Registration successful! Please login.";
  } catch (error) {
    message.style.color = "red";
    message.innerText = error.message;
  }
};

// Login existing user
loginBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    message.style.color = "green";
    message.innerText = "Login successful!";
  } catch (error) {
    message.style.color = "red";
    message.innerText = "Login failed: " + error.message;
  }
};

// Logout user
logoutBtn.onclick = async () => {
  await signOut(auth);
};

// Detect login state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    dashboard.style.display = "block";
    userEmail.textContent = user.email;
  } else {
    authBox.style.display = "block";
    dashboard.style.display = "none";
  }
});
