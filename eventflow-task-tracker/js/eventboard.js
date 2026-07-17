import { db, auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
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
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const modal = document.getElementById("taskModal");

const form = document.querySelector(".add-task-form");
const eventsGrid = document.getElementById("eventsGrid");

const addEventBtn = document.getElementById("AddTask");
const modalTitle = document.getElementById("modalTitle");

// Delete modal
const confirmModal = document.getElementById("confirmModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");

let eventIdToDelete = null;
let editingEventId = null; // Firestore doc id of the event being edited, or null when adding

const eventsRef = collection(db, "events");
const tasksRef = collection(db, "tasks");

const eventFilter = document.getElementById("eventFilter");

// Full event/task data kept in sync with the live listeners so cards can
// be rebuilt (and edited/deleted) without re-reading anything from the DOM.
let eventsCache = {};
let tasksCache = {};

let currentUserId = null;
let unsubscribeEvents = null;
let unsubscribeTasks = null;


// ===============================
// AUTH GUARD
// ===============================
// Only signed-in users may view the eventboard, and each user only ever
// sees their own events/tasks. Everyone else gets bounced back to login.
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

    if (unsubscribeEvents) unsubscribeEvents();
    if (unsubscribeTasks) unsubscribeTasks();
    startEventListener();
    startTaskListener();
});


// ===============================
// TASK OVERVIEW / DEADLINES ELEMENTS (RIGHT PANEL, BUILT FROM ALL TASKS)
// ===============================
const completedCountEl = document.getElementById("completedCount");
const progressCountEl = document.getElementById("progressCount");
const overdueCountEl = document.getElementById("overdueCount");
const progressPercentEl = document.getElementById("progressPercent");
const progressCircle = document.getElementById("progressCircle");
const upcomingDeadlinesList = document.getElementById("upcomingDeadlinesList");


// ===============================
// OPEN / CLOSE MODAL
// ===============================
openModal.addEventListener("click", () => {
    modal.classList.add("active");
    editingEventId = null;
    form.reset();

    addEventBtn.innerHTML = 'Add Event <i class="ri-add-large-line"></i>';
    modalTitle.textContent = "Add Event";
});

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
    editingEventId = null;
    form.reset();
});


// ===============================
// PROGRESS ANIMATION (RIGHT PANEL)
// ===============================
function animateProgressCircle(targetPercent) {

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

function updateTaskOverview() {

    const allTasks = Object.values(tasksCache);

    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    allTasks.forEach(task => {
        if (task.status === "Completed") completed++;
        else if (task.status === "In Progress") inProgress++;
        else if (task.status === "Overdue") overdue++;
    });

    const total = completed + inProgress + overdue;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    completedCountEl.textContent = completed;
    progressCountEl.textContent = inProgress;
    overdueCountEl.textContent = overdue;

    animateProgressCircle(percent);
}

function updateUpcomingDeadlines() {

    if (!upcomingDeadlinesList) return;

    upcomingDeadlinesList.innerHTML = "";

    const now = new Date();
    let upcomingFound = false;

    Object.values(tasksCache)
        .filter(task => task.status?.toLowerCase() === "in progress")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
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
                    <small>Assigned to ${task.assignedTo || "Unassigned"} • Due in ${daysRemaining} day(s)</small>
                `;

                upcomingDeadlinesList.appendChild(item);
            }
        });

    if (!upcomingFound) {
        upcomingDeadlinesList.innerHTML = `<p class="text-muted">No upcoming deadlines.</p>`;
    }
}


// ===============================
// GROUP TASKS UNDER THEIR EVENT
// ===============================
// Tasks are linked to an event purely by matching task.eventArea against
// event.eventName (trimmed, case-insensitive) - there's no foreign key.
function tasksForEvent(eventName) {
    const normalized = (eventName || "").trim().toLowerCase();

    return Object.values(tasksCache).filter(
        task => (task.eventArea || "").trim().toLowerCase() === normalized
    );
}

// Same matching rule as tasksForEvent, but returns doc ids instead of data -
// needed so deleting an event can also delete its linked tasks.
function taskIdsForEvent(eventName) {
    const normalized = (eventName || "").trim().toLowerCase();

    return Object.entries(tasksCache)
        .filter(([, task]) => (task.eventArea || "").trim().toLowerCase() === normalized)
        .map(([id]) => id);
}


// ===============================
// RENDER A SINGLE EVENT CARD
// ===============================
function buildEventCard(id, event) {
    const card = document.createElement("div");
    card.classList.add("event-card");
    card.dataset.id = id;

    const linkedTasks = tasksForEvent(event.eventName);

    let completed = 0, inProgress = 0, overdue = 0;
    linkedTasks.forEach(t => {
        if (t.status === "Completed") completed++;
        else if (t.status === "In Progress") inProgress++;
        else if (t.status === "Overdue") overdue++;
    });

    const total = linkedTasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    let formattedDate = "";
    if (event.date) {
        const parsedDate = new Date(event.date);
        formattedDate = isNaN(parsedDate)
            ? event.date
            : parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    card.dataset.date = event.date || "";

    const metaBits = [];
    if (formattedDate) metaBits.push(`<span><i class="ri-calendar-line"></i>${formattedDate}</span>`);
    if (event.location) metaBits.push(`<span><i class="ri-map-pin-line"></i>${event.location}</span>`);

    const tasksListHtml = total === 0
        ? `<p class="event-no-tasks">No tasks linked to this event area yet.</p>`
        : `<div class="event-tasks-list">
            ${linkedTasks.map(t => `
                <div class="event-task-item">
                    <span class="event-task-name">${t.taskName}</span>
                    <span class="status ${t.status.toLowerCase().replace(/\s/g, '-')}">
                        <i class="ri-circle-fill status-icon"></i>${t.status}
                    </span>
                </div>
            `).join("")}
          </div>`;

    card.innerHTML = `
        <div class="event-card-header">
            <span class="event-card-title">${event.eventName}</span>
            <div class="event-card-actions">
                <button class="edit-btn"><i class="ri-edit-line"></i></button>
                <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
            </div>
        </div>

        ${event.description ? `<p class="event-card-description">${event.description}</p>` : ""}

        ${metaBits.length ? `<div class="event-card-meta">${metaBits.join("")}</div>` : ""}

        <div class="event-progress-track">
            <div class="event-progress-fill" style="width:${percent}%"></div>
        </div>

        <div class="event-stats">
            <span><span class="completed-dot"></span>${completed} Completed</span>
            <span><span class="progress-dot"></span>${inProgress} In Progress</span>
            <span><span class="overdue-dot"></span>${overdue} Overdue</span>
        </div>

        ${tasksListHtml}
    `;

    return card;
}

function renderEventsGrid() {
    eventsGrid.innerHTML = "";

    const eventIds = Object.keys(eventsCache);

    if (eventIds.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events-message">
                <i class="ri-calendar-event-line"></i>
                <p>No events yet. Click "Add Event" to create your first one.</p>
            </div>
        `;
        return;
    }

    eventIds.forEach((id, index) => {
        const card = buildEventCard(id, eventsCache[id]);
        card.style.animationDelay = `${index * 60}ms`;
        eventsGrid.appendChild(card);
    });

    sortEventCards();
    filterEvents();
}

function sortEventCards() {
    const cards = Array.from(eventsGrid.querySelectorAll(".event-card"));

    // Dated events first (soonest first), undated events last
    cards.sort((a, b) => {
        const dateA = a.dataset.date ? new Date(a.dataset.date) : null;
        const dateB = b.dataset.date ? new Date(b.dataset.date) : null;

        if (dateA && dateB) return dateA - dateB;
        if (dateA) return -1;
        if (dateB) return 1;
        return 0;
    });

    cards.forEach(card => eventsGrid.appendChild(card));
}


// ===============================
// LIVE SYNC WITH FIRESTORE (SCOPED TO THE CURRENT USER)
// ===============================
function startEventListener() {

    const myEventsQuery = query(eventsRef, where("userId", "==", currentUserId));

    unsubscribeEvents = onSnapshot(myEventsQuery, (snapshot) => {

        eventsCache = {};
        snapshot.forEach((docSnap) => {
            eventsCache[docSnap.id] = docSnap.data();
        });

        renderEventsGrid();

    }, (error) => {
        console.error("Failed to load events:", error);
    });
}

function startTaskListener() {

    const myTasksQuery = query(tasksRef, where("userId", "==", currentUserId));

    unsubscribeTasks = onSnapshot(myTasksQuery, (snapshot) => {

        tasksCache = {};
        snapshot.forEach((docSnap) => {
            tasksCache[docSnap.id] = docSnap.data();
        });

        renderEventsGrid();
        updateTaskOverview();
        updateUpcomingDeadlines();

    }, (error) => {
        console.error("Failed to load tasks:", error);
    });
}


// ===============================
// SUBMIT FORM (ADD / EDIT)
// ===============================
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const eventName = document.getElementById("event-name").value.trim();
    const description = document.getElementById("event-description").value.trim();
    const location = document.getElementById("event-location").value.trim();
    const date = document.getElementById("event-date").value;

    addEventBtn.disabled = true;

    try {
        if (editingEventId) {
            // Don't touch userId on edit - the event should stay owned by whoever created it
            const eventData = { eventName, description, location, date };
            await updateDoc(doc(db, "events", editingEventId), eventData);
            editingEventId = null;
        } else {
            const eventData = { eventName, description, location, date, userId: currentUserId };
            await addDoc(eventsRef, eventData);
        }

        form.reset();
        modal.classList.remove("active");
        // onSnapshot handles re-rendering automatically
    } catch (err) {
        alert("Couldn't save event: " + err.message);
    } finally {
        addEventBtn.disabled = false;
    }
});


// ===============================
// EDIT / DELETE
// ===============================
function openEditModal(id) {
    const event = eventsCache[id];
    if (!event) return;

    editingEventId = id;

    document.getElementById("event-name").value = event.eventName || "";
    document.getElementById("event-description").value = event.description || "";
    document.getElementById("event-location").value = event.location || "";
    document.getElementById("event-date").value = event.date || "";

    modal.classList.add("active");
    addEventBtn.innerHTML = "Save Changes";
    modalTitle.textContent = "Edit Event";
}

function openDeleteConfirm(id) {
    eventIdToDelete = id;
    confirmModal.classList.add("active");
}

eventsGrid.addEventListener("click", function (e) {
    const id = e.target.closest(".event-card")?.dataset.id;
    if (!id) return;

    if (e.target.closest(".delete-btn")) openDeleteConfirm(id);
    if (e.target.closest(".edit-btn")) openEditModal(id);
});

cancelDelete.addEventListener("click", () => {
    confirmModal.classList.remove("active");
    eventIdToDelete = null;
});

confirmDeleteBtn.addEventListener("click", async () => {

    if (eventIdToDelete) {
        try {
            const event = eventsCache[eventIdToDelete];
            const linkedTaskIds = event ? taskIdsForEvent(event.eventName) : [];

            await Promise.all([
                deleteDoc(doc(db, "events", eventIdToDelete)),
                ...linkedTaskIds.map(id => deleteDoc(doc(db, "tasks", id)))
            ]);
        } catch (err) {
            alert("Couldn't delete event: " + err.message);
        }
    }

    confirmModal.classList.remove("active");
    eventIdToDelete = null;
    // onSnapshot handles re-rendering automatically
});


// ===============================
// FILTER
// ===============================
function filterEvents() {

    const selectedFilter = eventFilter.value;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const cards = document.querySelectorAll(".event-card");

    cards.forEach(card => {
        const dateStr = card.dataset.date;
        let show = true;

        if (selectedFilter === "Upcoming") {
            show = !!dateStr && new Date(dateStr) >= now;
        } else if (selectedFilter === "Past") {
            show = !!dateStr && new Date(dateStr) < now;
        } else if (selectedFilter === "No Date") {
            show = !dateStr;
        }

        card.style.display = show ? "" : "none";
    });
}

eventFilter.addEventListener("change", filterEvents);

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
        if (unsubscribeEvents) unsubscribeEvents();
        if (unsubscribeTasks) unsubscribeTasks();
        await signOut(auth);
    } finally {
        window.location.href = "index.html";
    }
});