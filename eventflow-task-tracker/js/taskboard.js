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
menuBtn.addEventListener('click', () =>{
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

themeToggler.addEventListener('click', () =>{
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
const tableBody = document.getElementById("taskTableBody");

const addTaskBtn = document.getElementById("AddTask");
const modalTitle = document.getElementById("modalTitle");

// Delete modal
const confirmModal = document.getElementById("confirmModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");

let taskIdToDelete = null;
let editingTaskId = null; // Firestore doc id of the task being edited, or null when adding

const tasksRef = collection(db, "tasks");

// ===============================
// TABLE / KANBAN VIEW SWITCH
// ===============================
const tableView = document.getElementById("tableView");
const kanbanView = document.getElementById("kanbanView");
const tableViewBtn = document.getElementById("tableViewBtn");
const kanbanViewBtn = document.getElementById("kanbanViewBtn");

const kanbanColumns = {
    "In Progress": document.getElementById("kanbanProgress"),
    "Completed": document.getElementById("kanbanCompleted"),
    "Overdue": document.getElementById("kanbanOverdue")
};

// Full task data keyed by Firestore doc id, kept in sync with the live
// listener so both the table and kanban card can edit/delete without
// re-reading it out of the DOM.
let tasksCache = {};

function setView(view) {
    const isKanban = view === "kanban";

    kanbanView.style.display = isKanban ? "flex" : "none";
    tableView.style.display = isKanban ? "none" : "block";

    kanbanViewBtn.classList.toggle("active", isKanban);
    tableViewBtn.classList.toggle("active", !isKanban);

    localStorage.setItem("eventflow-taskview", view);
}

tableViewBtn.addEventListener("click", () => setView("table"));
kanbanViewBtn.addEventListener("click", () => setView("kanban"));

setView(localStorage.getItem("eventflow-taskview") === "kanban" ? "kanban" : "table");

let currentUserId = null;
let unsubscribeTasks = null; // stops the previous listener when we switch users


// ===============================
// AUTH GUARD
// ===============================
// Only signed-in users may view the taskboard, and each user only ever
// sees their own tasks. Everyone else gets bounced back to the login page.
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUserId = user.uid;

    const profileName = document.querySelector(".profile .info p b");
    if (profileName) {
        // Use the first name they signed up with; fall back to email for
        // any older accounts that don't have a display name saved
        profileName.textContent = user.displayName
            ? user.displayName.split(" ")[0]
            : user.email;
    }

    if (unsubscribeTasks) unsubscribeTasks();
    startTaskListener();
});


// ===============================
// MULTI USER SYSTEM
// ===============================
let assignedUsers = [];

const assignedSelect = document.getElementById("assigned-to");

const selectedUsersContainer = document.getElementById("selected-users");
selectedUsersContainer.style.display = "flex";
selectedUsersContainer.style.flexWrap = "wrap";
selectedUsersContainer.style.gap = "6px";
selectedUsersContainer.style.marginBottom = "8px";

function renderAssignedUsers() {
    selectedUsersContainer.innerHTML = "";

    assignedUsers.forEach((user, index) => {
        const tag = document.createElement("span");
        tag.textContent = user;

        tag.style.padding = "4px 10px";
        tag.style.borderRadius = "20px";
        tag.style.background = "#991bdd";
        tag.style.color = "white";
        tag.style.fontSize = "12px";
        tag.style.cursor = "pointer";

        tag.onclick = () => {
            assignedUsers.splice(index, 1);
            renderAssignedUsers();
        };

        selectedUsersContainer.appendChild(tag);
    });
}

assignedSelect.addEventListener("change", () => {
    const value = assignedSelect.value;

    if (value && !assignedUsers.includes(value)) {
        assignedUsers.push(value);
        renderAssignedUsers();
    }

    assignedSelect.value = "";
});


// ===============================
// TASK OVERVIEW ELEMENTS
// ===============================
const completedCountEl = document.getElementById("completedCount");
const progressCountEl = document.getElementById("progressCount");
const overdueCountEl = document.getElementById("overdueCount");
const progressPercentEl = document.getElementById("progressPercent");
const progressCircle = document.getElementById("progressCircle");

const taskFilter = document.querySelector(".task-filter");


// ===============================
// OPEN / CLOSE MODAL
// ===============================
openModal.addEventListener("click", () => {
    modal.classList.add("active");
    editingTaskId = null;
    form.reset();
    assignedUsers = [];
    renderAssignedUsers();

    addTaskBtn.innerHTML = 'Add Task <i class="ri-add-large-line"></i>';
    modalTitle.textContent = "Add Task";
});

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
    editingTaskId = null;
    form.reset();
    assignedUsers = [];
    renderAssignedUsers();
});


// ===============================
// PROGRESS ANIMATION
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


// ===============================
// UPCOMING DEADLINES
// ===============================
function updateUpcomingDeadlines() {

    const deadlineContainer = document.getElementById("upcomingDeadlinesList");
    if (!deadlineContainer) return;

    deadlineContainer.innerHTML = "";

    const rows = tableBody.querySelectorAll("tr");
    const now = new Date();
    let upcomingFound = false;

    rows.forEach(row => {

        const status = row.getAttribute("data-status");
        if (status?.toLowerCase() !== "in progress") return;

        const taskName = row.cells[0].textContent;
        const eventArea = row.cells[1].textContent;
        const assignedTo = row.cells[2].textContent;
        const dueDate = new Date(row.cells[3].textContent);

        const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

        if (daysRemaining >= 0 && daysRemaining <= 7) {

            upcomingFound = true;

            const item = document.createElement("div");
            item.classList.add("deadline-item");

            item.innerHTML = `
                <p><b>${taskName}</b></p>
                <small>${eventArea}</small><br>
                <small>Assigned to ${assignedTo} • Due in ${daysRemaining} day(s)</small>
            `;

            deadlineContainer.appendChild(item);
        }
    });

    if (!upcomingFound) {
        deadlineContainer.innerHTML = `<p class="text-muted">No upcoming deadlines.</p>`;
    }
}


// ===============================
// TASK OVERVIEW
// ===============================
function updateTaskOverview() {

    const rows = tableBody.querySelectorAll("tr");

    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    rows.forEach(row => {

        const status = row.getAttribute("data-status");

        if (status === "Completed") completed++;
        else if (status === "In Progress") inProgress++;
        else if (status === "Overdue") overdue++;
    });

    const total = completed + inProgress + overdue;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    completedCountEl.textContent = completed;
    progressCountEl.textContent = inProgress;
    overdueCountEl.textContent = overdue;

    animateProgressCircle(percent);
}


// ===============================
// SORT
// ===============================
function sortTasksByDate() {

    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.sort((a, b) =>
        new Date(a.cells[3].textContent) - new Date(b.cells[3].textContent)
    );

    rows.forEach(row => tableBody.appendChild(row));
}


// ===============================
// RENDER A SINGLE ROW
// ===============================
function buildRow(id, task) {
    const row = document.createElement("tr");
    row.dataset.id = id;
    row.setAttribute("data-status", task.status);

    row.innerHTML = `
        <td>${task.taskName}</td>
        <td>${task.eventArea}</td>
        <td>${task.assignedTo}</td>
        <td>${task.dueDate}</td>
        <td>
            <span class="status ${task.status.toLowerCase().replace(/\s/g, '-')}">
                <i class="ri-circle-fill status-icon"></i>
                ${task.status}
            </span>
        </td>
        <td class="action-buttons">
            <button class="edit-btn"><i class="ri-edit-line"></i></button>
            <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
        </td>
    `;

    return row;
}


// ===============================
// RENDER A SINGLE KANBAN CARD
// ===============================
function buildKanbanCard(id, task) {
    const card = document.createElement("div");
    card.classList.add("kanban-card");
    card.dataset.id = id;
    card.dataset.due = task.dueDate;
    card.setAttribute("data-status", task.status);
    card.setAttribute("draggable", "true");

    const parsedDate = new Date(task.dueDate);
    const formattedDate = isNaN(parsedDate)
        ? task.dueDate
        : parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    card.innerHTML = `
        <div class="kanban-card-top">
            <span class="kanban-card-area">${task.eventArea}</span>
            <div class="kanban-card-actions">
                <button class="edit-btn"><i class="ri-edit-line"></i></button>
                <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
            </div>
        </div>
        <p class="kanban-card-title">${task.taskName}</p>
        <div class="kanban-card-footer">
            <span class="kanban-card-assignee"><i class="ri-user-line"></i>${task.assignedTo || "Unassigned"}</span>
            <span class="kanban-card-date"><i class="ri-calendar-line"></i>${formattedDate}</span>
        </div>
    `;

    return card;
}

function sortKanbanCards() {
    document.querySelectorAll(".kanban-cards").forEach((column) => {
        const cards = Array.from(column.children);
        cards.sort((a, b) => new Date(a.dataset.due) - new Date(b.dataset.due));
        cards.forEach((card) => column.appendChild(card));
    });
}

function updateKanbanCounts() {
    document.getElementById("kanbanCountProgress").textContent = kanbanColumns["In Progress"].children.length;
    document.getElementById("kanbanCountCompleted").textContent = kanbanColumns["Completed"].children.length;
    document.getElementById("kanbanCountOverdue").textContent = kanbanColumns["Overdue"].children.length;
}


// ===============================
// LIVE SYNC WITH FIRESTORE (SCOPED TO THE CURRENT USER)
// ===============================
// Whenever this user's tasks change in Firestore (add/edit/delete, from
// this tab or any other), rebuild the table automatically. Other users'
// tasks are never fetched at all, since the query itself is filtered.
function startTaskListener() {

    const myTasksQuery = query(tasksRef, where("userId", "==", currentUserId));

    unsubscribeTasks = onSnapshot(myTasksQuery, (snapshot) => {

        tableBody.innerHTML = "";
        Object.values(kanbanColumns).forEach((column) => (column.innerHTML = ""));
        tasksCache = {};

        snapshot.forEach((docSnap) => {
            const task = docSnap.data();
            tasksCache[docSnap.id] = task;

            const row = buildRow(docSnap.id, task);
            tableBody.appendChild(row);

            const card = buildKanbanCard(docSnap.id, task);
            const column = kanbanColumns[task.status];
            if (column) column.appendChild(card);
        });

        sortTasksByDate();
        sortKanbanCards();
        updateKanbanCounts();
        updateUpcomingDeadlines();
        updateTaskOverview();
        filterTasks();

    }, (error) => {
        console.error("Failed to load tasks:", error);
    });
}


// ===============================
// SUBMIT FORM (ADD / EDIT)
// ===============================
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const taskName = document.getElementById("task-name").value;
    const eventArea = document.getElementById("event-area").value;
    const dueDate = document.getElementById("due-date").value;
    const status = document.getElementById("status").value;

    const assignedText = assignedUsers.join(", ");

    addTaskBtn.disabled = true;

    try {
        if (editingTaskId) {
            // Don't touch userId on edit - the task should stay owned by whoever created it
            const taskData = { taskName, eventArea, assignedTo: assignedText, dueDate, status };
            await updateDoc(doc(db, "tasks", editingTaskId), taskData);
            editingTaskId = null;
        } else {
            const taskData = { taskName, eventArea, assignedTo: assignedText, dueDate, status, userId: currentUserId };
            await addDoc(tasksRef, taskData);
        }

        form.reset();
        assignedUsers = [];
        renderAssignedUsers();

        modal.classList.remove("active");
        // onSnapshot handles re-rendering, sorting, and stat updates automatically
    } catch (err) {
        alert("Couldn't save task: " + err.message);
    } finally {
        addTaskBtn.disabled = false;
    }
});


// ===============================
// EDIT / DELETE (SHARED BY TABLE AND KANBAN)
// ===============================
function openEditModal(id) {
    const task = tasksCache[id];
    if (!task) return;

    editingTaskId = id;

    document.getElementById("task-name").value = task.taskName;
    document.getElementById("event-area").value = task.eventArea;

    assignedUsers = task.assignedTo ? task.assignedTo.split(", ").filter(Boolean) : [];
    renderAssignedUsers();

    document.getElementById("due-date").value = task.dueDate;
    document.getElementById("status").value = task.status;

    modal.classList.add("active");
    addTaskBtn.innerHTML = "Save Changes";
    modalTitle.textContent = "Edit Task";
}

function openDeleteConfirm(id) {
    taskIdToDelete = id;
    confirmModal.classList.add("active");
}

// TABLE ACTIONS
tableBody.addEventListener("click", function (e) {
    const id = e.target.closest("tr")?.dataset.id;
    if (!id) return;

    if (e.target.closest(".delete-btn")) openDeleteConfirm(id);
    if (e.target.closest(".edit-btn")) openEditModal(id);
});

// KANBAN ACTIONS
kanbanView.addEventListener("click", function (e) {
    const id = e.target.closest(".kanban-card")?.dataset.id;
    if (!id) return;

    if (e.target.closest(".delete-btn")) openDeleteConfirm(id);
    if (e.target.closest(".edit-btn")) openEditModal(id);
});


// ===============================
// DELETE
// ===============================
cancelDelete.addEventListener("click", () => {
    confirmModal.classList.remove("active");
    taskIdToDelete = null;
});

confirmDeleteBtn.addEventListener("click", async () => {

    if (taskIdToDelete) {
        try {
            await deleteDoc(doc(db, "tasks", taskIdToDelete));
        } catch (err) {
            alert("Couldn't delete task: " + err.message);
        }
    }

    confirmModal.classList.remove("active");
    taskIdToDelete = null;
    // onSnapshot handles re-rendering, sorting, and stat updates automatically
});


// ===============================
// KANBAN DRAG & DROP (CHANGE STATUS BY DRAGGING BETWEEN COLUMNS)
// ===============================
let draggedTaskId = null;

kanbanView.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".kanban-card");
    if (!card) return;
    draggedTaskId = card.dataset.id;
    setTimeout(() => card.classList.add("dragging"), 0);
});

kanbanView.addEventListener("dragend", (e) => {
    const card = e.target.closest(".kanban-card");
    if (card) card.classList.remove("dragging");
    draggedTaskId = null;
});

Object.values(kanbanColumns).forEach((column) => {

    column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("drag-over");
    });

    column.addEventListener("drop", async (e) => {
        e.preventDefault();
        column.classList.remove("drag-over");

        if (!draggedTaskId) return;

        const newStatus = column.getAttribute("data-status");
        const task = tasksCache[draggedTaskId];

        if (!task || task.status === newStatus) return;

        try {
            await updateDoc(doc(db, "tasks", draggedTaskId), { status: newStatus });
        } catch (err) {
            alert("Couldn't update task: " + err.message);
        }
        // onSnapshot handles re-rendering, sorting, and stat updates automatically
    });
});


// ===============================
// FILTER
// ===============================
function filterTasks() {

    const selectedFilter = taskFilter.value;
    const items = document.querySelectorAll("#taskTableBody tr, .kanban-card");

    items.forEach(item => {

        const status = item.getAttribute("data-status");

        item.style.display =
            selectedFilter === "All Tasks" || status === selectedFilter
                ? ""
                : "none";
    });
}

taskFilter.addEventListener("change", filterTasks);

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