import { db, auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
    collection,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const currentDate = document.getElementById("current-date");

const today = new Date();

const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
};

currentDate.textContent = today.toLocaleDateString("en-US", options);

// CLOSE BTN
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");

//DARK THEME
const themeToggler = document.querySelector(".theme-toggler");

// SHOW SIDEBAR
menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
})

// CLOSE SIDEBAR
closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
})

//CHANGE TO DARK THEME
// Keep the toggle icons in sync with whatever the blocking script in
// <head> already applied on page load
if (document.documentElement.classList.contains('dark-theme-variables')) {
    themeToggler.querySelector('i:nth-child(1)').classList.remove('active');
    themeToggler.querySelector('i:nth-child(2)').classList.add('active');
}

themeToggler.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-theme-variables');

    themeToggler.querySelector('i:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('i:nth-child(2)').classList.toggle('active');

    const isDark = document.documentElement.classList.contains('dark-theme-variables');
    localStorage.setItem('eventflow-theme', isDark ? 'dark' : 'light');
})


// ===============================
// DOM ELEMENTS
// ===============================
const recentTasksBody = document.getElementById("recentTasksBody");

const tasksRef = collection(db, "tasks");

let currentUserId = null;
let unsubscribeTasks = null; // stops the previous listener when we switch users


// ===============================
// AUTH GUARD
// ===============================
// Only signed-in users may view the dashboard, and each user only ever
// sees their own tasks. Everyone else gets bounced back to the login page.
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUserId = user.uid;

    const profileName = document.querySelector(".profile .info p b");
    if (profileName) {
        profileName.textContent = user.displayName
            ? user.displayName.split(" ")[0]
            : user.email;
    }

    if (unsubscribeTasks) unsubscribeTasks();
    startTaskListener();
});


// ===============================
// PROGRESS RING HELPERS
// ===============================
// r=50, so circumference = 2 * PI * 50
const RING_CIRCUMFERENCE = 2 * Math.PI * 50;

function setRingPercent(circleEl, percent) {
    if (!circleEl) return;
    const filled = (percent / 100) * RING_CIRCUMFERENCE;
    circleEl.style.strokeDasharray = `${filled} ${RING_CIRCUMFERENCE}`;
    circleEl.style.strokeDashoffset = 0;
}

function animateBigProgressCircle(targetPercent) {

    const progressCircle = document.getElementById("progressCircle");
    const progressPercentEl = document.getElementById("progressPercent");
    if (!progressCircle || !progressPercentEl) return;

    const startTime = performance.now();
    const duration = 800;

    function animate(now) {

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPercent = Math.round(progress * targetPercent);

        progressPercentEl.textContent = `${currentPercent}%`;

        progressCircle.style.background = `
            conic-gradient(
                var(--color-primary) 0% ${currentPercent}%,
                var(--color-info-light) ${currentPercent}% 100%
            )
        `;

        if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


// ===============================
// UPCOMING DEADLINES
// ===============================
function updateUpcomingDeadlines(tasks) {

    const deadlineContainer = document.getElementById("upcomingDeadlinesList");
    if (!deadlineContainer) return;

    deadlineContainer.innerHTML = "";

    const now = new Date();
    let upcomingFound = false;

    tasks
        .filter(task => task.status === "In Progress")
        .forEach(task => {

            const dueDate = new Date(task.dueDate);
            const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            if (daysRemaining >= 0 && daysRemaining <= 7) {

                upcomingFound = true;

                const item = document.createElement("div");
                item.classList.add("deadline-item");

                item.innerHTML = `
                    <p><b>${task.taskName}</b></p>
                    <small>${task.eventArea}</small><br>
                    <small>Assigned to ${task.assignedTo} • Due in ${daysRemaining} day(s)</small>
                `;

                deadlineContainer.appendChild(item);
            }
        });

    if (!upcomingFound) {
        deadlineContainer.innerHTML = `<p class="text-muted">No upcoming deadlines.</p>`;
    }
}


// ===============================
// RECENT TASKS TABLE
// ===============================
function updateRecentTasks(tasks) {

    if (!recentTasksBody) return;

    recentTasksBody.innerHTML = "";

    if (tasks.length === 0) {
        recentTasksBody.innerHTML = `<tr><td colspan="6" class="text-muted">No tasks yet.</td></tr>`;
        return;
    }

    // Soonest due dates first, top 5
    const recent = [...tasks]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    recent.forEach(task => {
        const row = document.createElement("tr");

        const statusClass = task.status === "Completed" ? "success"
            : task.status === "Overdue" ? "danger"
            : "warning";

        row.innerHTML = `
            <td>${task.taskName}</td>
            <td>${task.eventArea}</td>
            <td>${task.assignedTo}</td>
            <td>${task.dueDate}</td>
            <td class="${statusClass}">${task.status}</td>
            <td><a href="taskboard.html" class="primary">Details</a></td>
        `;

        recentTasksBody.appendChild(row);
    });
}


// ===============================
// INSIGHT CARDS (TOP ROW)
// ===============================
function updateInsightCards(tasks) {

    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const overdue = tasks.filter(t => t.status === "Overdue").length;

    const pct = (count) => total === 0 ? 0 : Math.round((count / total) * 100);

    document.getElementById("totalTasksCount").textContent = total;
    document.getElementById("totalTasksPercent").textContent = "100%";
    setRingPercent(document.getElementById("totalTasksCircle"), 100);

    document.getElementById("inProgressCardCount").textContent = inProgress;
    document.getElementById("inProgressCardPercent").textContent = `${pct(inProgress)}%`;
    setRingPercent(document.getElementById("inProgressCircle"), pct(inProgress));

    document.getElementById("completedCardCount").textContent = completed;
    document.getElementById("completedCardPercent").textContent = `${pct(completed)}%`;
    setRingPercent(document.getElementById("completedCircle"), pct(completed));

    document.getElementById("overdueCardCount").textContent = overdue;
    document.getElementById("overdueCardPercent").textContent = `${pct(overdue)}%`;
    setRingPercent(document.getElementById("overdueCircle"), pct(overdue));
}


// ===============================
// TASK OVERVIEW (RIGHT PANEL)
// ===============================
function updateTaskOverview(tasks) {

    const completed = tasks.filter(t => t.status === "Completed").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const overdue = tasks.filter(t => t.status === "Overdue").length;

    const total = completed + inProgress + overdue;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("completedCount").textContent = completed;
    document.getElementById("progressCount").textContent = inProgress;
    document.getElementById("overdueCount").textContent = overdue;

    animateBigProgressCircle(percent);
}


// ===============================
// LIVE SYNC WITH FIRESTORE (SCOPED TO THE CURRENT USER)
// ===============================
function startTaskListener() {

    const myTasksQuery = query(tasksRef, where("userId", "==", currentUserId));

    unsubscribeTasks = onSnapshot(myTasksQuery, (snapshot) => {

        const tasks = snapshot.docs.map(docSnap => docSnap.data());

        updateInsightCards(tasks);
        updateRecentTasks(tasks);
        updateUpcomingDeadlines(tasks);
        updateTaskOverview(tasks);

    }, (error) => {
        console.error("Failed to load tasks:", error);
    });
}


// ===============================
// LOGOUT MODAL
// ===============================
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const cancelLogout = document.getElementById("cancelLogout");
const confirmLogout = document.getElementById("confirmLogout");

logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.classList.add("active");
});

cancelLogout.addEventListener("click", () => {
    logoutModal.classList.remove("active");
});

confirmLogout.addEventListener("click", async () => {
    try {
        if (unsubscribeTasks) unsubscribeTasks();
        await signOut(auth);
    } finally {
        window.location.href = "index.html";
    }
});