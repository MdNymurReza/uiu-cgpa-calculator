import { db, auth } from "./firebase.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ---------- UI Elements ----------
const authSection = document.getElementById("auth-section");
const calculatorSection = document.getElementById("calculator-section");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addTrimesterBtn = document.getElementById("addTrimesterBtn");
const saveDataBtn = document.getElementById("saveDataBtn");
const trimesterContainer = document.getElementById("trimesterContainer");
const totalCGPA = document.getElementById("totalCGPA");

let userId = null;
let trimesterData = [];

// ---------- Grade Conversion ----------
function getGradePoint(grade) {
  const scale = {
    "A": 4.00, "A-": 3.67, "B+": 3.33, "B": 3.00, "B-": 2.67,
    "C+": 2.33, "C": 2.00, "C-": 1.67, "D+": 1.33, "D": 1.00, "F": 0.00
  };
  return scale[grade.toUpperCase()] ?? 0.00;
}

// ---------- Add Trimester ----------
addTrimesterBtn.onclick = () => {
  const name = document.getElementById("trimesterName").value.trim();
  if (!name) return alert("Enter trimester name!");

  const trimesterDiv = document.createElement("div");
  trimesterDiv.classList.add("trimester");

  trimesterDiv.innerHTML = `
    <h3>${name}</h3>
    <div class="course-container"></div>
    <button class="addCourseBtn">+ Add Course</button>
    <p><strong>Trimester GPA:</strong> <span class="gpa">0.00</span></p>
  `;

  trimesterContainer.appendChild(trimesterDiv);

  const courseContainer = trimesterDiv.querySelector(".course-container");
  trimesterDiv.querySelector(".addCourseBtn").onclick = () => addCourseRow(courseContainer, trimesterDiv);

  trimesterData.push({ name, courses: [] });
};

function addCourseRow(container, trimesterDiv) {
  const row = document.createElement("div");
  row.classList.add("course-row");

  row.innerHTML = `
    <input type="text" placeholder="Course Name">
    <input type="number" placeholder="Credit" min="0" step="0.5">
    <input type="text" placeholder="Grade (e.g., A-)">
  `;

  container.appendChild(row);

  row.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => calculateTrimesterGPA(trimesterDiv));
  });
}

function calculateTrimesterGPA(trimesterDiv) {
  const rows = trimesterDiv.querySelectorAll(".course-row");
  let totalCredit = 0, totalPoints = 0;

  rows.forEach(r => {
    const [name, creditInput, gradeInput] = r.querySelectorAll("input");
    const credit = parseFloat(creditInput.value) || 0;
    const grade = gradeInput.value.trim();
    const point = getGradePoint(grade);
    totalCredit += credit;
    totalPoints += credit * point;
  });

  const gpa = totalCredit ? (totalPoints / totalCredit).toFixed(2) : "0.00";
  trimesterDiv.querySelector(".gpa").innerText = gpa;
  updateCGPA();
}

function updateCGPA() {
  const gpas = [];
  let totalCredits = 0, totalPoints = 0;

  document.querySelectorAll(".trimester").forEach(t => {
    const gpa = parseFloat(t.querySelector(".gpa").innerText);
    const rows = t.querySelectorAll(".course-row");

    rows.forEach(r => {
      const credit = parseFloat(r.querySelectorAll("input")[1].value) || 0;
      const grade = r.querySelectorAll("input")[2].value.trim();
      const point = getGradePoint(grade);
      totalCredits += credit;
      totalPoints += credit * point;
    });
    gpas.push(gpa);
  });

  const cgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  totalCGPA.innerText = cgpa;
}

// ---------- Firebase Auth ----------
registerBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth, email, password);
  alert("Registered Successfully!");
};

loginBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, email, password);
  alert("Logged In!");
};

logoutBtn.onclick = async () => {
  await signOut(auth);
  location.reload();
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId = user.uid;
    authSection.style.display = "none";
    calculatorSection.style.display = "block";
    await loadUserData();
  } else {
    authSection.style.display = "block";
    calculatorSection.style.display = "none";
  }
});

// ---------- Save & Load ----------
saveDataBtn.onclick = async () => {
  const data = { trimesters: [] };

  document.querySelectorAll(".trimester").forEach(t => {
    const trimesterName = t.querySelector("h3").innerText;
    const rows = t.querySelectorAll(".course-row");
    const courses = [];

    rows.forEach(r => {
      const [name, credit, grade] = r.querySelectorAll("input");
      courses.push({
        name: name.value.trim(),
        credit: parseFloat(credit.value),
        grade: grade.value.trim(),
      });
    });

    data.trimesters.push({
      trimesterName,
      gpa: parseFloat(t.querySelector(".gpa").innerText),
      courses
    });
  });

  await setDoc(doc(db, "users", userId), data);
  alert("Data Saved Successfully!");
};

async function loadUserData() {
  const snap = await getDoc(doc(db, "users", userId));
  if (snap.exists()) {
    const data = snap.data();
    trimesterContainer.innerHTML = "";
    data.trimesters.forEach(t => {
      const trimesterDiv = document.createElement("div");
      trimesterDiv.classList.add("trimester");
      trimesterDiv.innerHTML = `
        <h3>${t.trimesterName}</h3>
        <div class="course-container"></div>
        <button class="addCourseBtn">+ Add Course</button>
        <p><strong>Trimester GPA:</strong> <span class="gpa">${t.gpa}</span></p>
      `;
      trimesterContainer.appendChild(trimesterDiv);

      const container = trimesterDiv.querySelector(".course-container");
      t.courses.forEach(c => {
        const row = document.createElement("div");
        row.classList.add("course-row");
        row.innerHTML = `
          <input type="text" value="${c.name}">
          <input type="number" value="${c.credit}">
          <input type="text" value="${c.grade}">
        `;
        container.appendChild(row);
      });

      trimesterDiv.querySelector(".addCourseBtn").onclick = () => addCourseRow(container, trimesterDiv);
    });
    updateCGPA();
  }
}
