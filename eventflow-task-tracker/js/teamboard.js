import { db, auth } from "./firebase-config.js";
import { isTaskOverdue, getOverdueTasks, syncOverdueTasks } from "./task-utils.js";
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
    where,
    serverTimestamp
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

const form = document.querySelector(".add-person-form");
const tableBody = document.getElementById("peopleTableBody");

const addPersonBtn = document.getElementById("AddPerson");
const modalTitle = document.getElementById("modalTitle");

const nameInput = document.getElementById("person-name");
const emailInput = document.getElementById("person-email");
const roleInput = document.getElementById("person-role");

// Delete modal
const confirmModal = document.getElementById("confirmModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");

let personIdToDelete = null;
let editingPersonId = null; // Firestore doc id of the person being edited, or null when adding

const teamRef = collection(db, "teamMembers");
const tasksRef = collection(db, "tasks");

// Full team data keyed by Firestore doc id
let teamCache = {};

let currentUserId = null;
let unsubscribeTeam = null; // stops the previous listener when we switch users
let unsubscribeTasks = null; // stops the previous listener when we switch users


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

    if (unsubscribeTeam) unsubscribeTeam();
    startTeamListener();

    if (unsubscribeTasks) unsubscribeTasks();
    startTaskListener();
});


// ===============================
// OPEN / CLOSE MODAL
// ===============================
openModal.addEventListener("click", () => {
    modal.classList.add("active");
    editingPersonId = null;
    form.reset();
    nameInput.setCustomValidity("");
    emailInput.setCustomValidity("");

    addPersonBtn.innerHTML = 'Add Person <i class="ri-add-large-line"></i>';
    modalTitle.textContent = "Add Person";
});

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
    editingPersonId = null;
    form.reset();
    nameInput.setCustomValidity("");
    emailInput.setCustomValidity("");
});

nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));
emailInput.addEventListener("input", () => emailInput.setCustomValidity(""));


// ===============================
// RENDER A SINGLE ROW
// ===============================
function buildRow(id, person) {
    const row = document.createElement("tr");
    row.dataset.id = id;

    row.innerHTML = `
        <td>${person.name}</td>
        <td>${person.email}</td>
        <td><span class="role-badge">${person.role}</span></td>
        <td class="actions-cell">
            <div class="action-buttons">
                <button class="edit-btn"><i class="ri-edit-line"></i></button>
                <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
            </div>
        </td>
    `;

    return row;
}

function sortPeopleByName() {
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.sort((a, b) => {
        const nameA = teamCache[a.dataset.id]?.name || "";
        const nameB = teamCache[b.dataset.id]?.name || "";
        return nameA.localeCompare(nameB);
    });

    rows.forEach(row => tableBody.appendChild(row));
}


// ===============================
// TEAM OVERVIEW (RIGHT PANEL)
// ===============================
function updateTeamOverview() {
    const overviewList = document.getElementById("teamOverviewList");
    if (!overviewList) return;

    const people = Object.values(teamCache);

    if (people.length === 0) {
        overviewList.innerHTML = `<p class="text-muted">No team members yet.</p>`;
        return;
    }

    const roleCounts = {};
    people.forEach((person) => {
        const role = person.role || "Unspecified";
        roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const roleLines = Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([role, count]) => `<small>${role} • ${count}</small>`)
        .join("<br>");

    overviewList.innerHTML = `
        <div class="deadline-item">
            <p><b>${people.length} ${people.length === 1 ? "person" : "people"} total</b></p>
            ${roleLines}
        </div>
    `;
}


// ===============================
// LIVE SYNC WITH FIRESTORE (SCOPED TO THE CURRENT USER)
// ===============================
function startTeamListener() {

    const myTeamQuery = query(teamRef, where("userId", "==", currentUserId));

    unsubscribeTeam = onSnapshot(myTeamQuery, (snapshot) => {

        tableBody.innerHTML = "";
        teamCache = {};

        snapshot.forEach((docSnap) => {
            const person = docSnap.data();
            teamCache[docSnap.id] = person;

            const row = buildRow(docSnap.id, person);
            tableBody.appendChild(row);
        });

        sortPeopleByName();
        updateTeamOverview();

    }, (error) => {
        console.error("Failed to load team members:", error);
    });
}


// ===============================
// PROGRESS RING HELPER
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
// TASK OVERVIEW (RIGHT PANEL)
// ===============================
function updateTaskOverview(tasks) {

    const completed = tasks.filter(t => t.status === "Completed").length;
    const overdue = getOverdueTasks(tasks).length;
    const inProgress = tasks.filter(t => t.status === "In Progress" && !isTaskOverdue(t)).length;

    const total = completed + inProgress + overdue;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("completedCount").textContent = completed;
    document.getElementById("progressCount").textContent = inProgress;
    document.getElementById("overdueCount").textContent = overdue;

    animateBigProgressCircle(percent);
}


// ===============================
// LIVE SYNC WITH FIRESTORE - TASKS (SCOPED TO THE CURRENT USER)
// ===============================
function startTaskListener() {

    const myTasksQuery = query(tasksRef, where("userId", "==", currentUserId));

    unsubscribeTasks = onSnapshot(myTasksQuery, (snapshot) => {

        syncOverdueTasks(db, snapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        const tasks = snapshot.docs.map(docSnap => docSnap.data());

        updateUpcomingDeadlines(tasks);
        updateTaskOverview(tasks);

    }, (error) => {
        console.error("Failed to load tasks:", error);
    });
}


// ===============================
// SUBMIT FORM (ADD / EDIT)
// ===============================
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleInput.value.trim();

    if (!name) {
        nameInput.setCustomValidity("Name can't be empty or just spaces.");
        nameInput.reportValidity();
        return;
    }
    nameInput.setCustomValidity("");

    // Prevent adding the same email twice (case-insensitive), except when
    // editing that same person
    const normalizedEmail = email.toLowerCase();
    const duplicate = Object.entries(teamCache).find(
        ([id, person]) => person.email?.toLowerCase() === normalizedEmail && id !== editingPersonId
    );

    if (duplicate) {
        emailInput.setCustomValidity("Someone with this email is already on your team.");
        emailInput.reportValidity();
        return;
    }
    emailInput.setCustomValidity("");

    if (!form.reportValidity()) return;

    addPersonBtn.disabled = true;

    try {
        if (editingPersonId) {
            await updateDoc(doc(db, "teamMembers", editingPersonId), { name, email, role });
            editingPersonId = null;
        } else {
            await addDoc(teamRef, { name, email, role, userId: currentUserId, createdAt: serverTimestamp() });
        }

        form.reset();
        modal.classList.remove("active");
        // onSnapshot handles re-rendering automatically
    } catch (err) {
        alert("Couldn't save this person: " + err.message);
    } finally {
        addPersonBtn.disabled = false;
    }
});


// ===============================
// EDIT / DELETE
// ===============================
function openEditModal(id) {
    const person = teamCache[id];
    if (!person) return;

    editingPersonId = id;

    nameInput.value = person.name;
    emailInput.value = person.email;
    roleInput.value = person.role;

    modal.classList.add("active");
    addPersonBtn.innerHTML = "Save Changes";
    modalTitle.textContent = "Edit Person";
}

function openDeleteConfirm(id) {
    personIdToDelete = id;
    confirmModal.classList.add("active");
}

tableBody.addEventListener("click", function (e) {
    const id = e.target.closest("tr")?.dataset.id;
    if (!id) return;

    if (e.target.closest(".delete-btn")) openDeleteConfirm(id);
    if (e.target.closest(".edit-btn")) openEditModal(id);
});


// ===============================
// DELETE
// ===============================
cancelDelete.addEventListener("click", () => {
    confirmModal.classList.remove("active");
    personIdToDelete = null;
});

confirmDeleteBtn.addEventListener("click", async () => {

    if (personIdToDelete) {
        try {
            await deleteDoc(doc(db, "teamMembers", personIdToDelete));
        } catch (err) {
            alert("Couldn't remove this person: " + err.message);
        }
    }

    confirmModal.classList.remove("active");
    personIdToDelete = null;
});


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
        if (unsubscribeTeam) unsubscribeTeam();
        if (unsubscribeTasks) unsubscribeTasks();
        await signOut(auth);
    } finally {
        window.location.href = "index.html";
    }
});