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

const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
};

currentDate.textContent = today.toLocaleDateString("en-US", dateOptions);

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
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthYear = document.getElementById("calendarMonthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const dayTasksModal = document.getElementById("dayTasksModal");
const closeDayTasksModal = document.getElementById("closeDayTasksModal");
const dayTasksTitle = document.getElementById("dayTasksTitle");
const dayTasksList = document.getElementById("dayTasksList");

const tasksRef = collection(db, "tasks");

let currentUserId = null;
let unsubscribeTasks = null; // stops the previous listener when we switch users

let allTasks = [];          // the current user's tasks, refreshed live from Firestore
let viewDate = new Date();  // which month is currently showing on the calendar


// ===============================
// AUTH GUARD
// ===============================
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
// LIVE SYNC WITH FIRESTORE (SCOPED TO THE CURRENT USER)
// ===============================
function startTaskListener() {

    const myTasksQuery = query(tasksRef, where("userId", "==", currentUserId));

    unsubscribeTasks = onSnapshot(myTasksQuery, (snapshot) => {

        allTasks = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        renderCalendar();
        updateUpcomingDeadlines();
        updateTaskOverview();

    }, (error) => {
        console.error("Failed to load tasks:", error);
    });
}


// ===============================
// CALENDAR RENDERING
// ===============================

// Group tasks by their due date ("YYYY-MM-DD" -> [task, task, ...])
function groupTasksByDate() {
    const map = {};
    allTasks.forEach(task => {
        if (!task.dueDate) return;
        if (!map[task.dueDate]) map[task.dueDate] = [];
        map[task.dueDate].push(task);
    });
    return map;
}

function statusClass(status) {
    if (status === "Completed") return "completed";
    if (status === "Overdue") return "overdue";
    return "in-progress";
}

// Format a Date as a local YYYY-MM-DD string (matches how <input type="date">
// values are stored, avoiding UTC/timezone drift from toISOString)
function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function renderCalendar() {

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    calendarMonthYear.textContent = viewDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    const tasksByDate = groupTasksByDate();

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayKey = toDateKey(new Date());

    const cells = [];

    // Leading days from the previous month, to fill the first week
    for (let i = startWeekday - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const cellDate = new Date(year, month - 1, dayNum);
        cells.push({ date: cellDate, otherMonth: true });
    }

    // This month's days
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(year, month, d), otherMonth: false });
    }

    // Trailing days from next month, to complete the last week
    while (cells.length % 7 !== 0) {
        const nextIndex = cells.length - (startWeekday + daysInMonth) + 1;
        cells.push({ date: new Date(year, month + 1, nextIndex), otherMonth: true });
    }

    calendarGrid.innerHTML = "";

    cells.forEach(cell => {

        const dateKey = toDateKey(cell.date);
        const dayTasks = tasksByDate[dateKey] || [];

        const dayEl = document.createElement("div");
        dayEl.classList.add("calendar-day");
        if (cell.otherMonth) dayEl.classList.add("other-month");
        if (dateKey === todayKey) dayEl.classList.add("today");

        const maxVisible = 3;
        const visibleTasks = dayTasks.slice(0, maxVisible);
        const overflowCount = dayTasks.length - visibleTasks.length;

        dayEl.innerHTML = `
            <span class="day-number">${cell.date.getDate()}</span>
            <div class="day-tasks">
                ${visibleTasks.map(task => `
                    <span class="task-chip ${statusClass(task.status)}">${task.taskName}</span>
                `).join("")}
                ${overflowCount > 0 ? `<span class="more-tasks">+${overflowCount} more</span>` : ""}
            </div>
        `;

        if (dayTasks.length > 0) {
            dayEl.addEventListener("click", () => openDayTasksModal(cell.date, dayTasks));
        }

        calendarGrid.appendChild(dayEl);
    });
}

function openDayTasksModal(date, tasks) {

    dayTasksTitle.textContent = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    dayTasksList.innerHTML = tasks.map(task => `
        <div class="day-task-item">
            <div class="day-task-header">
                <b>${task.taskName}</b>
                <span class="status ${task.status.toLowerCase().replace(/\s/g, '-')}">
                    <i class="ri-circle-fill status-icon"></i>
                    ${task.status}
                </span>
            </div>
            <small class="text-muted">${task.eventArea}</small><br>
            <small class="text-muted">Assigned to ${task.assignedTo || "—"}</small>
        </div>
    `).join("");

    dayTasksModal.classList.add("active");
}

closeDayTasksModal.addEventListener("click", () => {
    dayTasksModal.classList.remove("active");
});

prevMonthBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
});


// ===============================
// PROGRESS RING (RIGHT PANEL)
// ===============================
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
function updateUpcomingDeadlines() {

    const deadlineContainer = document.getElementById("upcomingDeadlinesList");
    if (!deadlineContainer) return;

    deadlineContainer.innerHTML = "";

    const now = new Date();
    let upcomingFound = false;

    allTasks
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
// TASK OVERVIEW (RIGHT PANEL)
// ===============================
function updateTaskOverview() {

    const completed = allTasks.filter(t => t.status === "Completed").length;
    const inProgress = allTasks.filter(t => t.status === "In Progress").length;
    const overdue = allTasks.filter(t => t.status === "Overdue").length;

    const total = completed + inProgress + overdue;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("completedCount").textContent = completed;
    document.getElementById("progressCount").textContent = inProgress;
    document.getElementById("overdueCount").textContent = overdue;

    animateBigProgressCircle(percent);
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


// ===============================
// INIT
// ===============================
renderCalendar();
