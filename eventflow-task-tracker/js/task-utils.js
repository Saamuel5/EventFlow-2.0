import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ===============================
// SHARED TASK HELPERS
// ===============================
// A task counts as overdue if:
//   1) someone has manually set its status to "Overdue", OR
//   2) its due date has passed and it hasn't been marked "Completed"
//      (covers tasks still sitting at "In Progress" whose date slipped by)
export function isTaskOverdue(task) {
    if (!task) return false;
    if (task.status === "Overdue") return true;
    if (task.status === "Completed") return false;
    if (!task.dueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
}

export function getOverdueTasks(tasks) {
    return tasks.filter(isTaskOverdue);
}

// ===============================
// AUTO-OVERDUE SYNC (PERSISTS TO FIRESTORE)
// ===============================
// isTaskOverdue() only computes the *effective* status for display - a
// task's stored `status` field in Firestore still says "In Progress" until
// someone edits it by hand. This walks whatever task list a page just
// received from its live listener and flips the stored status to
// "Overdue" for any task that has silently passed its due date, so the
// change is written once and then shows up everywhere - including in
// queries/exports that read `status` directly instead of recomputing it.
//
// Safe to call from every board's task listener: only tasks that actually
// need the flip get written, so once a task is synced this becomes a
// no-op for it on the very next snapshot, and several tabs/pages calling
// it at the same time just redundantly write the same value rather than
// conflicting.
export async function syncOverdueTasks(db, tasks) {
    const toSync = tasks.filter(t => t.status === "In Progress" && isTaskOverdue(t));

    await Promise.all(
        toSync.map(t =>
            updateDoc(doc(db, "tasks", t.id), { status: "Overdue" }).catch(err => {
                console.error(`Failed to auto-mark task ${t.id} as Overdue:`, err);
            })
        )
    );
}
