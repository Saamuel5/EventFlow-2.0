import { db, auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
    collection,
    onSnapshot,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc
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

const viewTasksBtn = document.getElementById("viewTasksBtn");
const viewEventsBtn = document.getElementById("viewEventsBtn");

// Edit Task modal
const editTaskModal = document.getElementById("editTaskModal");
const closeEditTaskModal = document.getElementById("closeEditTaskModal");
const editTaskForm = document.getElementById("editTaskForm");
const editTaskNameInput = document.getElementById("edit-task-name");
const editTaskEventSelect = document.getElementById("edit-task-event");
const editTaskAssignedSelect = document.getElementById("edit-task-assigned-to");
const editTaskSelectedUsersContainer = document.getElementById("edit-task-selected-users");
editTaskSelectedUsersContainer.style.display = "flex";
editTaskSelectedUsersContainer.style.flexWrap = "wrap";
editTaskSelectedUsersContainer.style.gap = "6px";
editTaskSelectedUsersContainer.style.marginBottom = "8px";
const editTaskPrioritySelect = document.getElementById("edit-task-priority");
const editTaskStatusSelect = document.getElementById("edit-task-status");
const editTaskDueDateInput = document.getElementById("edit-task-due-date");
const saveTaskBtn = document.getElementById("saveTaskBtn");
let editingTaskId = null;

// ===============================
// MULTI USER SYSTEM (SAME BEHAVIOR AS THE TASKBOARD)
// ===============================
let editTaskAssignedUsers = [];

// At least one person must be assigned. editTaskAssignedSelect isn't itself
// bound to editTaskAssignedUsers, so its validity is set manually here and
// checked via editTaskForm.reportValidity() on submit.
function validateEditTaskAssignedUsers() {
    if (editTaskAssignedUsers.length === 0) {
        editTaskAssignedSelect.setCustomValidity("Please assign at least one person to this task.");
    } else {
        editTaskAssignedSelect.setCustomValidity("");
    }
}

function renderEditTaskAssignedUsers() {
    editTaskSelectedUsersContainer.innerHTML = "";
    validateEditTaskAssignedUsers();

    editTaskAssignedUsers.forEach((user, index) => {
        const tag = document.createElement("span");
        tag.textContent = user;

        tag.style.padding = "4px 10px";
        tag.style.borderRadius = "20px";
        tag.style.background = "#991bdd";
        tag.style.color = "white";
        tag.style.fontSize = "12px";
        tag.style.cursor = "pointer";

        tag.onclick = () => {
            editTaskAssignedUsers.splice(index, 1);
            renderEditTaskAssignedUsers();
        };

        editTaskSelectedUsersContainer.appendChild(tag);
    });
}

editTaskAssignedSelect.addEventListener("change", () => {
    const value = editTaskAssignedSelect.value;

    if (value && !editTaskAssignedUsers.includes(value)) {
        editTaskAssignedUsers.push(value);
        renderEditTaskAssignedUsers();
    }

    editTaskAssignedSelect.value = "";
});

// Edit Event modal
const editEventModal = document.getElementById("editEventModal");
const closeEditEventModal = document.getElementById("closeEditEventModal");
const editEventForm = document.getElementById("editEventForm");
const editEventNameInput = document.getElementById("edit-event-name");
const editEventDescriptionInput = document.getElementById("edit-event-description");
const editEventLocationInput = document.getElementById("edit-event-location");
const editEventDateInput = document.getElementById("edit-event-date");
const saveEventBtn = document.getElementById("saveEventBtn");
let editingEventId = null;

// Delete confirmation (shared by both tasks and events)
const deleteItemModal = document.getElementById("deleteItemModal");
const deleteItemTitle = document.getElementById("deleteItemTitle");
const deleteItemMessage = document.getElementById("deleteItemMessage");
const cancelDeleteItem = document.getElementById("cancelDeleteItem");
const confirmDeleteItem = document.getElementById("confirmDeleteItem");
let itemToDeleteType = null; // "task" or "event"
let itemToDeleteId = null;

const tasksRef = collection(db, "tasks");
const eventsRef = collection(db, "events");

let currentUserId = null;
let unsubscribeTasks = null;  // stops the previous listener when we switch users
let unsubscribeEvents = null;

let allTasks = [];          // the current user's tasks, refreshed live from Firestore
let allEvents = [];         // the current user's events, refreshed live from Firestore
let viewDate = new Date();  // which month is currently showing on the calendar
let currentView = "tasks";  // "tasks" or "events" - which data the calendar currently shows


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
    if (unsubscribeEvents) unsubscribeEvents();
    startTaskListener();
    startEventListener();
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

function startEventListener() {

    const myEventsQuery = query(eventsRef, where("userId", "==", currentUserId));

    unsubscribeEvents = onSnapshot(myEventsQuery, (snapshot) => {

        allEvents = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        populateEditTaskEventOptions();
        renderCalendar();

    }, (error) => {
        console.error("Failed to load events:", error);
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

// Group events by their date ("YYYY-MM-DD" -> [event, event, ...])
function groupEventsByDate() {
    const map = {};
    allEvents.forEach(event => {
        if (!event.date) return;
        if (!map[event.date]) map[event.date] = [];
        map[event.date].push(event);
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
    const eventsByDate = groupEventsByDate();

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
        const dayItems = currentView === "tasks"
            ? (tasksByDate[dateKey] || [])
            : (eventsByDate[dateKey] || []);

        const dayEl = document.createElement("div");
        dayEl.classList.add("calendar-day");
        if (cell.otherMonth) dayEl.classList.add("other-month");
        if (dateKey === todayKey) dayEl.classList.add("today");

        const maxVisible = 3;
        const visibleItems = dayItems.slice(0, maxVisible);
        const overflowCount = dayItems.length - visibleItems.length;

        const chipsHtml = currentView === "tasks"
            ? visibleItems.map(task => `
                <span class="task-chip ${statusClass(task.status)}">${task.taskName}</span>
            `).join("")
            : visibleItems.map(event => `
                <span class="event-chip">${event.eventName}</span>
            `).join("");

        dayEl.innerHTML = `
            <span class="day-number">${cell.date.getDate()}</span>
            <div class="day-tasks">
                ${chipsHtml}
                ${overflowCount > 0 ? `<span class="more-tasks">+${overflowCount} more</span>` : ""}
            </div>
        `;

        if (dayItems.length > 0) {
            dayEl.addEventListener("click", () => openDayItemsModal(cell.date, dayItems));
        }

        calendarGrid.appendChild(dayEl);
    });
}

function openDayItemsModal(date, items) {

    dayTasksTitle.textContent = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    if (currentView === "tasks") {
        dayTasksList.innerHTML = items.map(task => `
            <div class="day-task-item">
                <div class="day-task-header">
                    <b>${task.taskName}</b>
                    <div class="day-task-header-right">
                        <span class="status ${task.status.toLowerCase().replace(/\s/g, '-')}">
                            <i class="ri-circle-fill status-icon"></i>
                            ${task.status}
                        </span>
                        <button class="edit-day-item-btn" data-id="${task.id}" title="Edit task">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="delete-day-item-btn" data-id="${task.id}" title="Delete task">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <small class="text-muted">${task.eventArea}</small><br>
                <small class="text-muted">Assigned to ${task.assignedTo || "—"}</small>
            </div>
        `).join("");

        dayTasksList.querySelectorAll(".edit-day-item-btn").forEach(btn => {
            btn.addEventListener("click", () => openEditTaskModal(btn.dataset.id));
        });

        dayTasksList.querySelectorAll(".delete-day-item-btn").forEach(btn => {
            btn.addEventListener("click", () => openDeleteConfirm("task", btn.dataset.id));
        });

    } else {
        dayTasksList.innerHTML = items.map(event => `
            <div class="day-task-item">
                <div class="day-task-header">
                    <b>${event.eventName}</b>
                    <div class="day-task-header-right">
                        <button class="edit-day-item-btn" data-id="${event.id}" title="Edit event">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="delete-day-item-btn" data-id="${event.id}" title="Delete event">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                ${event.location ? `<small class="text-muted"><i class="ri-map-pin-line"></i> ${event.location}</small><br>` : ""}
                ${event.description ? `<small class="text-muted">${event.description}</small>` : ""}
            </div>
        `).join("");

        dayTasksList.querySelectorAll(".edit-day-item-btn").forEach(btn => {
            btn.addEventListener("click", () => openEditEventModal(btn.dataset.id));
        });

        dayTasksList.querySelectorAll(".delete-day-item-btn").forEach(btn => {
            btn.addEventListener("click", () => openDeleteConfirm("event", btn.dataset.id));
        });
    }

    dayTasksModal.classList.add("active");
}

closeDayTasksModal.addEventListener("click", () => {
    dayTasksModal.classList.remove("active");
});


// ===============================
// VIEW TOGGLE (TASKS / EVENTS)
// ===============================
viewTasksBtn.addEventListener("click", () => {
    currentView = "tasks";
    viewTasksBtn.classList.add("active");
    viewEventsBtn.classList.remove("active");
    renderCalendar();
});

viewEventsBtn.addEventListener("click", () => {
    currentView = "events";
    viewEventsBtn.classList.add("active");
    viewTasksBtn.classList.remove("active");
    renderCalendar();
});


// ===============================
// DELETE (SHARED CONFIRM MODAL)
// ===============================
function openDeleteConfirm(type, id) {
    itemToDeleteType = type;
    itemToDeleteId = id;

    if (type === "task") {
        deleteItemTitle.textContent = "Delete Task?";
        deleteItemMessage.textContent = "This action cannot be undone. Do you want to continue?";
    } else {
        deleteItemTitle.textContent = "Delete Event?";
        deleteItemMessage.textContent = "This action cannot be undone. Tasks linked to this event will also be deleted.";
    }

    dayTasksModal.classList.remove("active");
    deleteItemModal.classList.add("active");
}

cancelDeleteItem.addEventListener("click", () => {
    deleteItemModal.classList.remove("active");
    itemToDeleteType = null;
    itemToDeleteId = null;
});

confirmDeleteItem.addEventListener("click", async () => {
    if (!itemToDeleteId) {
        deleteItemModal.classList.remove("active");
        return;
    }

    try {
        if (itemToDeleteType === "task") {
            await deleteDoc(doc(db, "tasks", itemToDeleteId));
        } else {
            // Cascade delete: same rule as the Events page - any task whose
            // eventArea matches this event's name (trimmed, case-insensitive)
            // gets deleted along with the event itself.
            const event = allEvents.find(ev => ev.id === itemToDeleteId);
            const normalizedName = (event?.eventName || "").trim().toLowerCase();

            const linkedTaskIds = allTasks
                .filter(t => (t.eventArea || "").trim().toLowerCase() === normalizedName)
                .map(t => t.id);

            await Promise.all([
                deleteDoc(doc(db, "events", itemToDeleteId)),
                ...linkedTaskIds.map(id => deleteDoc(doc(db, "tasks", id)))
            ]);
        }
    } catch (err) {
        alert("Couldn't delete: " + err.message);
    }

    deleteItemModal.classList.remove("active");
    itemToDeleteType = null;
    itemToDeleteId = null;
    // onSnapshot handles re-rendering automatically
});


// ===============================
// EDIT TASK (FROM THE DAY MODAL)
// ===============================
function populateEditTaskEventOptions() {
    editTaskEventSelect.innerHTML = allEvents.map(event =>
        `<option value="${event.eventName}">${event.eventName}</option>`
    ).join("");
}

function openEditTaskModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;

    editTaskNameInput.value = task.taskName || "";
    editTaskNameInput.setCustomValidity("");
    editTaskEventSelect.value = task.eventArea || "";

    editTaskAssignedUsers = task.assignedTo ? task.assignedTo.split(", ").filter(Boolean) : [];
    renderEditTaskAssignedUsers();

    editTaskPrioritySelect.value = task.priority || "Medium";
    editTaskStatusSelect.value = task.status || "In Progress";

    // Same bounds as the taskboard: no later than 5 years from now on the
    // upper end, but past dates stay allowed since a task can legitimately
    // already be overdue when it's being edited.
    setEditTaskDueDateBounds(true);
    editTaskDueDateInput.value = task.dueDate || "";
    validateTaskStatusAgainstDueDate();

    dayTasksModal.classList.remove("active");
    editTaskModal.classList.add("active");
}

closeEditTaskModal.addEventListener("click", () => {
    editTaskModal.classList.remove("active");
    editingTaskId = null;
    editTaskAssignedUsers = [];
    renderEditTaskAssignedUsers();
    editTaskNameInput.setCustomValidity("");
});

// ===============================
// DUE DATE / STATUS VALIDATION
// ===============================
// Same rule as the taskboard: a task can't be "In Progress" once its due
// date has passed (should be Overdue or Completed instead), and it can't
// be "Overdue" before its due date has arrived. Completed is unrestricted
// either way.
function isPastDate(dateStr) {
    if (!dateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dateStr + "T00:00:00");
    return due < today;
}

function isFutureDate(dateStr) {
    if (!dateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dateStr + "T00:00:00");
    return due > today;
}

function validateTaskStatusAgainstDueDate() {
    if (editTaskStatusSelect.value === "In Progress" && isPastDate(editTaskDueDateInput.value)) {
        editTaskStatusSelect.setCustomValidity("This due date has already passed — set status to Overdue (or Completed) instead of In Progress.");
    } else if (editTaskStatusSelect.value === "Overdue" && isFutureDate(editTaskDueDateInput.value)) {
        editTaskStatusSelect.setCustomValidity("This due date hasn't passed yet — a task can't be Overdue until its due date arrives.");
    } else {
        editTaskStatusSelect.setCustomValidity("");
    }
}

editTaskDueDateInput.addEventListener("change", validateTaskStatusAgainstDueDate);
editTaskStatusSelect.addEventListener("change", validateTaskStatusAgainstDueDate);

editTaskNameInput.addEventListener("input", () => editTaskNameInput.setCustomValidity(""));

// Guards against typo'd years (e.g. 2016 or 2126) in the due-date field,
// same as the taskboard's setDueDateBounds. Past dates stay allowed here
// since we're always editing an existing task, which may already be overdue.
function setEditTaskDueDateBounds(allowPast) {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 5);

    const toISO = (d) => d.toISOString().split("T")[0];

    editTaskDueDateInput.min = allowPast ? "" : toISO(today);
    editTaskDueDateInput.max = toISO(maxDate);
}

editTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editingTaskId) return;

    const taskName = editTaskNameInput.value.trim();

    if (!taskName) {
        editTaskNameInput.setCustomValidity("Task name can't be empty or just spaces.");
        editTaskNameInput.reportValidity();
        return;
    }
    editTaskNameInput.setCustomValidity("");

    validateEditTaskAssignedUsers();
    if (!editTaskForm.reportValidity()) return;

    saveTaskBtn.disabled = true;

    try {
        await updateDoc(doc(db, "tasks", editingTaskId), {
            taskName,
            eventArea: editTaskEventSelect.value,
            assignedTo: editTaskAssignedUsers.join(", "),
            priority: editTaskPrioritySelect.value,
            status: editTaskStatusSelect.value,
            dueDate: editTaskDueDateInput.value
        });

        editTaskModal.classList.remove("active");
        editingTaskId = null;
        editTaskAssignedUsers = [];
        renderEditTaskAssignedUsers();
        // onSnapshot handles re-rendering automatically
    } catch (err) {
        alert("Couldn't save task: " + err.message);
    } finally {
        saveTaskBtn.disabled = false;
    }
});


// ===============================
// EDIT EVENT (FROM THE DAY MODAL)
// ===============================
function openEditEventModal(eventId) {
    const event = allEvents.find(ev => ev.id === eventId);
    if (!event) return;

    editingEventId = eventId;

    editEventNameInput.value = event.eventName || "";
    editEventDescriptionInput.value = event.description || "";
    editEventLocationInput.value = event.location || "";
    editEventDateInput.value = event.date || "";

    dayTasksModal.classList.remove("active");
    editEventModal.classList.add("active");
}

closeEditEventModal.addEventListener("click", () => {
    editEventModal.classList.remove("active");
    editingEventId = null;
});

editEventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editingEventId) return;

    saveEventBtn.disabled = true;

    try {
        await updateDoc(doc(db, "events", editingEventId), {
            eventName: editEventNameInput.value.trim(),
            description: editEventDescriptionInput.value.trim(),
            location: editEventLocationInput.value.trim(),
            date: editEventDateInput.value
        });

        editEventModal.classList.remove("active");
        editingEventId = null;
        // onSnapshot handles re-rendering automatically
    } catch (err) {
        alert("Couldn't save event: " + err.message);
    } finally {
        saveEventBtn.disabled = false;
    }
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