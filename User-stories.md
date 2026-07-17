# User Stories — EventFlow Task Tracker System
## BAI21113 Software Engineering Project

**Product Owner:** Tharany A/P Jayakumar

---

## Carried Over from Assignment (US1–US10)

| ID | User Story | Acceptance Criteria | Priority | Points | Iteration |
|----|------------|-------------------|----------|--------|-----------|
| 1 | As a user, I want to register an account so that I can securely access my tasks. | User can register with name, email and password. Duplicate emails rejected. Error shown for invalid input. | High | 5 | 1 |
| 2 | As a user, I want to login and logout so that I can securely access my account. | User can login with correct credentials. Invalid login shows error. Session cleared on logout. | High | 3 | 1 |
| 3 | As a user, I want to create new tasks with title, description and deadline so that I can track my work. | Task saved with all fields. Empty title shows validation error. Deadline must be future date. | High | 8 | 1 |
| 4 | As a user, I want to view all my tasks in a task list so that I can monitor my activities. | All tasks displayed. Empty state shown when no tasks. Tasks sorted by deadline. | High | 5 | 1 |
| 5 | As a user, I want to edit existing task details so that I can update task information when needed. | All fields editable. Changes saved immediately. Validation applied on edit. | Medium | 8 | 1 |
| 6 | As a user, I want to delete tasks I no longer need so I can keep my task list organised. | Task removed after confirmation. Action cannot be undone. | Medium | 3 | 1 |
| 7 | As a user, I want to mark task status (In Progress, Completed, Overdue) so I can track completion. | Status updates immediately. Tasks colour coded by status. | High | 8 | 2 |
| 8 | As a user, I want to filter tasks by status so I can quickly find specific tasks. | Filter by status, priority and date. Multiple filters work together. | Medium | 5 | 2 |
| 9 | As a user, I want to view a task statistics dashboard so I can monitor my overall progress. | Dashboard shows completion percentage, total tasks and upcoming deadlines. | Low | 5 | 2 |
| 10 | As a user, I want to logout securely so that my account is protected when I am done. | Session cleared on logout. Redirected to login page. | High | 3 | 2 |

---

## New User Stories for Project (US11–US15)

| ID | User Story | Acceptance Criteria | Priority | Points | Iteration |
|----|------------|-------------------|----------|--------|-----------|
| 11 | As a user, I want to assign task priority (High, Medium, Low) so I can focus on important tasks first. | Priority label visible on task card. Tasks sortable by priority. Colour coded labels. | High | 5 | 2 |
| 12 | As a user, I want my data stored in a database so my tasks are saved permanently. | Tasks persist after page refresh. Data stored in Firebase. All CRUD operations work. | High | 13 | 2 |
| 13 | As a user, I want to view tasks on a Kanban board so I can visualise my workflow. | Board shows To Do, In Progress, Done columns. Tasks moveable between columns. | Medium | 8 | 3 |
| 14 | As a user, I want a calendar view for upcoming deadlines so I can plan my schedule. | Calendar shows tasks due on each date. Overdue tasks highlighted red. | Medium | 8 | 3 |
| 15 | As a user, I want improved form validation so I enter correct and complete information. | All forms validated. Clear error messages. No empty submissions allowed. | Medium | 5 | 3 |

---

## Summary

| Iteration | User Stories | Focus |
|-----------|-------------|-------|
| Iteration 1 | US1 - US6 | MVP: Login, Register, Create, View, Edit, Delete |
| Iteration 2 | US7 - US12 | Enhancement: Status, Filter, Upcoming deadlines, Dark/Light mode, Logout |
| Iteration 3 | US13 - US15 | Advanced: Dashboard, Priority, Database, Kanban Board, Calendar, Validation |

**Total Story Points: 89**