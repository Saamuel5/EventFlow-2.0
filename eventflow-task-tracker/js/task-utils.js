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
