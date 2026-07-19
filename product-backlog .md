# Product Backlog — EventFlow 2.0
## BAI21113 Software Engineering Project

**Product Owner:** Tharany A/P Jayakumar


**Total backlog: 128 story points across 25 items | 125 points delivered (97.7%)**

---

## Functional Requirements (User Stories)

| ID | User Story | Acceptance Criteria | Priority | Points | Status | Sprint |
|----|------------|----------------------|----------|-------:|--------|:---:|
| US1 | As a user, I want to register an account so that I can securely access my tasks. | User can register with name, email and password. Duplicate emails rejected. Error shown for invalid input. | High | 5 | ✅ Done | 1 |
| US2 | As a user, I want to login and logout so that I can securely access my account. | User can login with correct credentials. Invalid login shows error. Session cleared on logout. | High | 3 | ✅ Done | 1 |
| US3 | As a user, I want to create new tasks with title, description and deadline so that I can track my work. | Task saved with all fields. Empty title shows validation error. Deadline must be a future date. | High | 8 | ✅ Done | 1 |
| US4 | As a user, I want to view all my tasks in a task list so that I can monitor my activities. | All tasks displayed. Empty state shown when no tasks. Tasks sorted by deadline. | High | 5 | ✅ Done | 1 |
| US5 | As a user, I want to edit existing task details so that I can update task information when needed. | All fields editable. Changes saved immediately. Validation applied on edit. | Medium | 8 | ✅ Done | 1 |
| US6 | As a user, I want to delete tasks I no longer need so I can keep my task list organised. | Task removed after confirmation. Action cannot be undone. | Medium | 3 | ✅ Done | 1 |
| US7 | As a user, I want to mark task status (In Progress, Completed, Overdue) so I can track completion. | Status updates immediately. Tasks colour coded by status. | High | 8 | ✅ Done | 2 |
| US8 | As a user, I want to filter tasks by status so I can quickly find specific tasks. | Filter by status, priority and date. Multiple filters work together. | Medium | 5 | ✅ Done | 2 |
| US9 | As a user, I want to view a task statistics dashboard so I can monitor my overall progress. | Dashboard shows completion percentage, total tasks and upcoming deadlines. | Low | 5 | ✅ Done | 2 |
| US10 | As a user, I want to logout securely so that my account is protected when I am done. | Session cleared on logout. Redirected to login page. | High | 3 | ✅ Done | 2 |
| US11 | As a user, I want to assign task priority (High, Medium, Low) so I can focus on important tasks first. | Priority label visible on task card. Tasks sortable by priority. Colour coded labels. | High | 5 | ✅ Done | 3 |
| US12 | As a user, I want my data stored in a database so my tasks are saved permanently. | Tasks persist after page refresh. Data stored in Firebase. All CRUD operations work. | High | 13 | ✅ Done | 3 |
| US13 | As a user, I want to view tasks on a Kanban board so I can visualise my workflow. | Board shows In Progress, Completed and Overdue columns. Tasks moveable between columns. | Medium | 8 | ✅ Done | 3 |
| US14 | As a user, I want a calendar view for upcoming deadlines so I can plan my schedule. | Calendar shows tasks due on each date. Overdue tasks highlighted red. Tasks/events toggle available. | Medium | 8 | ✅ Done | 3 |
| US15 | As a user, I want improved form validation so I enter correct and complete information. | All forms validated. Clear error messages. No empty submissions allowed. | Medium | 5 | ✅ Done | 3 |

**Functional subtotal: 92 points — all 15/15 done**

---

## Technical Requirements

| ID | Requirement | Acceptance Criteria | Priority | Points | Status | Sprint |
|----|-------------|----------------------|----------|-------:|--------|:---:|
| TR1 | Set up GitHub repository with a main + feature-branch strategy, issue templates and labels. | Repo created. Branching strategy documented in README. Labels/milestones configured. | High | 3 | ✅ Done | 1 |
| TR2 | Configure GitHub Projects board with Backlog / To Do / In Progress / Testing / Done columns. | Board created and linked to repo. All issues tracked on the board. | High | 2 | ✅ Done | 1 |
| TR3 | Integrate Firebase SDK and configure the database connection for the app. | `firebase-config.js` connects successfully. Read/write test succeeds from the browser console. | High | 5 | ✅ Done | 3 |
| TR4 | Implement Firebase CRUD operations (Create, Read, Update, Delete) for tasks. | All four operations verified manually. Data changes reflect in Firebase console in real time. | High | 8 | ✅ Done | 3 |
| TR5 | Implement client-side form validation utilities shared across task forms. | Required fields checked before submit. Reusable validation functions in `task-utils.js`. | Medium | 5 | ✅ Done | 3 |
| TR6 | Tag a GitHub release at the end of each iteration (v1.0, v2.0, v3.0). | Release tag exists on GitHub for each completed iteration with release notes. | Medium | 2 | ✅ Done | 3 |

**Technical subtotal: 25 points — all 6/6 done**

---

## Non-Functional / Non-Technical Requirements

| ID | Requirement | Acceptance Criteria | Priority | Points | Status | Sprint |
|----|-------------|----------------------|----------|-------:|--------|:---:|
| NFR1 | The application must be usable on Google Chrome and Microsoft Edge without console errors. | Manual test pass on both browsers for every feature before a sprint is closed. | High | 3 | ✅ Done | 1 |
| NFR2 | The README must document the project description, setup steps, team roles and an iteration summary. | README reviewed and approved by Product Owner at the end of each sprint. | Medium | 2 | ✅ Done | 2 |
| NFR3 | The interface should stay visually consistent (EventFlow branding, colours, layout) across all pages. | Shared CSS variables/styles reused across index, taskboard, dashboard, calendar and teamboard. | Low | 3 | ✅ Done | 2 |
| NFR4 | The team must produce a reflective report and individual contribution summary at project close. | 2,000–2,500 word report covering process, challenges and lessons learned, submitted with the project. | Medium | 3 | ⬜ To Do | 3 |

**Non-functional subtotal: 11 points — 3/4 done (NFR4 outstanding)**

---

## Backlog Summary by Sprint

| Sprint | Focus | Planned Points | Completed Points | Velocity | Status |
|---|---|---:|---:|---:|---|
| Sprint 1 | MVP — login, register, create/view tasks, repo & board setup | 40 | 40 | 40 | ✅ Complete |
| Sprint 2 | Enhancements — status, filter, dashboard, edit/deletion task, upcoming deadlines, dark/light mode, logout, realese tags, testing | 57 | 57 | 57 | ✅ Complete |
| Sprint 3 | Advanced — Kanban board, calendar, validation, priority, Firebase, release, documentation | 31 | 28 | 28 | ⬜ 1 item open (NFR4) |
| **Total** | | **128** | **125** | **avg. 48.5*** | **97.7% delivered** |

*Average velocity calculated across Sprints 1 and 2, the two fully closed sprints.

---

## Backlog Summary by Category

| Category | Items | Points | Done |
|---|---:|---:|---:|
| Functional (User Stories) | 15 | 92 | 15/15 |
| Technical Requirements | 6 | 25 | 6/6 |
| Non-Functional / Non-Technical | 4 | 11 | 3/4 |
| **Total** | **25** | **128** | **24/25** |

---

