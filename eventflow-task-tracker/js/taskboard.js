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

let rowToDelete = null;
let editingTaskId = null; // Firestore doc id of the task being edited, or null when adding

const tasksRef = collection(db, "tasks");

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
// LIVE SYNC WITH FIRESTORE (SCOPED TO THE CURRENT USER)
// ===============================
// Whenever this user's tasks change in Firestore (add/edit/delete, from
// this tab or any other), rebuild the table automatically. Other users'
// tasks are never fetched at all, since the query itself is filtered.
function startTaskListener() {

    const myTasksQuery = query(tasksRef, where("userId", "==", currentUserId));

    unsubscribeTasks = onSnapshot(myTasksQuery, (snapshot) => {

        tableBody.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const row = buildRow(docSnap.id, docSnap.data());
            tableBody.appendChild(row);
        });

        sortTasksByDate();
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
// TABLE ACTIONS
// ===============================
tableBody.addEventListener("click", function (e) {

    if (e.target.closest(".delete-btn")) {
        rowToDelete = e.target.closest("tr");
        confirmModal.classList.add("active");
    }

    if (e.target.closest(".edit-btn")) {

        const row = e.target.closest("tr");
        editingTaskId = row.dataset.id;

        document.getElementById("task-name").value = row.cells[0].textContent;
        document.getElementById("event-area").value = row.cells[1].textContent;

        assignedUsers = row.cells[2].textContent.split(", ").filter(Boolean);
        renderAssignedUsers();

        document.getElementById("due-date").value = row.cells[3].textContent;
        document.getElementById("status").value = row.getAttribute("data-status");

        modal.classList.add("active");
        addTaskBtn.innerHTML = "Save Changes";

        modalTitle.textContent = "Edit Task";
    }
});


// ===============================
// DELETE
// ===============================
cancelDelete.addEventListener("click", () => {
    confirmModal.classList.remove("active");
    rowToDelete = null;
});

confirmDeleteBtn.addEventListener("click", async () => {

    if (rowToDelete) {
        try {
            await deleteDoc(doc(db, "tasks", rowToDelete.dataset.id));
        } catch (err) {
            alert("Couldn't delete task: " + err.message);
        }
    }

    confirmModal.classList.remove("active");
    rowToDelete = null;
    // onSnapshot handles re-rendering, sorting, and stat updates automatically
});


// ===============================
// FILTER
// ===============================
function filterTasks() {

    const selectedFilter = taskFilter.value;
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        const status = row.getAttribute("data-status");

        row.style.display =
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