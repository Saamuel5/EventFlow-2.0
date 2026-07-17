# EventFlow 2.0

## Team Members

| Name                        | Role          |
| --------------------------- | ------------- |
| Tharany A/P Jayakumar       | Product Owner |
| Shanjana De Lerra Mahendran | Developer     |
| Saamuel Kolandasamy         | Scrum Master  |

**Course:** BAI21113 Software Engineering

---

## About This Project

EventFlow 2.0 is a task management system designed to help users create, organise, monitor, and complete their tasks efficiently.

The application allows users to manage task priorities, save task information permanently using Firebase, monitor workflow through a Kanban board, and view upcoming deadlines using a calendar.

The project demonstrates Agile Scrum methodology, iterative and incremental development, database integration, GitHub collaboration, version control, testing, and project documentation.

---

## Project Tools

1. GitHub
2. Git Bash
3. Visual Studio Code
4. HTML
5. CSS
6. JavaScript
7. Firebase
8. GitHub Projects

---

## Agile Methodology

This project follows the **Agile Scrum methodology** using GitHub Issues, branches, pull requests, milestones, releases, and a GitHub Project Board.

Scrum was selected because it supports teamwork, short development cycles, continuous feedback, task division, and incremental system improvement.

The project is divided into three iterations. Each iteration delivers a working version of the application with additional features.

---

# Product Backlog

## Product Owner

**Tharany A/P Jayakumar**

---

## New User Stories for Final Project

| ID   | User Story                                                                                                 | Acceptance Criteria                                                                                            | Priority | Points | Iteration |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- | -----: | --------: |
| US11 | As a user, I want to assign task priority as High, Medium, or Low so I can focus on important tasks first. | Priority label is visible on the task card. Tasks can be sorted by priority. Priority labels are colour coded. | High     |      5 |         2 |
| US12 | As a user, I want my data stored in a database so my tasks are saved permanently.                          | Tasks remain after page refresh. Data is stored in Firebase. All CRUD operations work correctly.               | High     |     13 |         2 |
| US13 | As a user, I want to view tasks on a Kanban board so I can visualise my workflow.                          | The board displays To Do, In Progress, and Done columns. Tasks can be moved between columns.                   | Medium   |      8 |         3 |
| US14 | As a user, I want a calendar view for upcoming deadlines so I can plan my schedule.                        | The calendar displays tasks according to their due dates. Overdue tasks are highlighted in red.                | Medium   |      8 |         3 |
| US15 | As a user, I want improved form validation so I enter correct and complete information.                    | All forms are validated. Clear error messages are displayed. Empty submissions are prevented.                  | Medium   |      5 |         3 |

---

## Product Backlog Summary

| Iteration   | User Stories | Focus                                                                       |
| ----------- | ------------ | --------------------------------------------------------------------------- |
| Iteration 1 | US1–US6      | Core system: Login, Register, Create, View, Edit, and Delete tasks          |
| Iteration 2 | US7–US12     | Enhancements: Status, Filtering, Dashboard, Priority |
| Iteration 3 | US13–US15    | Advanced features: Kanban Board, Calendar View, and Form Validation and Firebase Database      |

**Total Story Points: 89**

---

# Sprint Planning

The EventFlow 2.0 final project is developed through three iterations.

Iteration 1 contains the core features transferred from the previous assignment. Iterations 2 and 3 introduce the new features developed for the final project.

---

## Sprint Planning

### Sprint 1: Minimum Viable Product

Sprint 1 focuses on developing the basic working version of the Event Flow.

#### Sprint 1 Goal
Develop the minimum viable product with core task management features including user authentication and basic task functionality.

#### Duration
Week 1 (7 days) — Team Capacity: 3 members

#### Sprint 1 Features
- User registration
- User login
- Create task
- View task list

#### Sprint 1 Backlog

| Task | Assignee | Status | Estimated Hours | Actual Hours |
|------|----------|--------|-----------------|--------------|
| Setup GitHub repository & project board | Saamuel Kolandasamy | ✅ Completed | 2 hours | 2 hours |
| Create README and product backlog documentation | Saamuel Kolandasamy | ✅ Completed | 1.5 hours | 2 hours |
| Design and implement login & registration UI | Shanjana De Lerra | ✅ Completed | 4 hours | 4 hours |
| Implement task creation functionality | Shanjana De Lerra | ✅ Completed | 3 hours | 1 hour 30 minutes |
| Implement task list view | Shanjana De Lerra | ✅ Completed | 1 hour | 30 minutes |
| Define user stories and prioritise backlog | Tharany A/P Jayakumar | ✅ Completed | 2 hours | 1.5 hours |
| Review Sprint 1 features and test functionality | Tharany A/P Jayakumar | ✅ Completed | 1.5 hours | 1 hour |

#### Definition of Completed — Sprint 1
- Code committed and pushed to GitHub
- Feature working correctly in browser
- No console errors
- Tested on at least 2 browsers (Microsoft Edge, Google Chrome)
- Pull request reviewed and merged

---

### Sprint 2: Feature Enhancement

Sprint 2 focuses on improving and extending the features developed in Sprint 1.

#### Sprint 2 Goal
Enhance functionality and complete the system with full task management features, UI improvements, and advanced dashboard capabilities.

#### Duration
Week 3 (7 days) — Team Capacity: 3 members

#### Sprint 2 Features
- Edit task
- Delete task
- Mark task as completed
- Filter tasks by status
- Task statistics dashboard with completion chart
- Upcoming deadlines section
- Dark/light mode toggle
- Logout functionality with confirmation modal
- Improved user interface
- Improved validation

#### Sprint 2 Backlog

| Task | Assignee | Status | Estimated Hours | Actual Hours |
|------|----------|--------|-----------------|--------------|
| Implement task editing feature | Shanjana De Lerra | ✅ Completed | 4 hours | 2 hours |
| Implement task deletion with confirmation | Shanjana De Lerra | ✅ Completed | 1.5 hours | 1 hour 30 minutes |
| Add task status management (To Do, In Progress, Done) | Shanjana De Lerra | ✅ Completed | 2.5 hours | 3 hours |
| Implement task filtering by status | Shanjana De Lerra | ✅ Completed | 2 hours | 2.5 hours |
| Build task statistics dashboard with completion chart | Shanjana De Lerra | ✅ Completed | 3 hours | 3 hours |
| Add upcoming deadlines section | Shanjana De Lerra | ✅ Completed | 2 hours | 2 hours |
| Implement dark/light mode toggle | Shanjana De Lerra | ✅ Completed | 1.5 hours | 1 hour |
| Implement logout functionality with confirmation modal | Shanjana De Lerra | ✅ Completed | 1.5 hours | 1 hour |
| Conduct UI improvement and final testing | Saamuel Kolandasamy | ✅ Completed | 2 hours | 2 hours |
| Review completed features and confirm requirements | Tharany A/P Jayakumar | ✅ Completed | 2 hours | 2 hours |
| Prepare final documentation | Tharany A/P Jayakumar | ✅ Completed | 1.5 hours | 2 hours |
| Release tags | Saamuel Kolandasamy | ✅ Completed | 1.5 hours | 2 hours |

#### Definition of Completed — Sprint 2
- All product backlog items completed
- System fully functional with no bugs
- README.md complete and up to date
- Release tags `v0.1-iteration1` and `v0.2-iteration2` created
- All pull requests reviewed and merged

---

## Sprint 3: Advanced Task Visualisation and Validation

Sprint 3 focuses on introducing advanced task management features that allow users to visualise their workflow, monitor deadlines, and enter complete and accurate task information.

### Sprint 3 Goal

Complete EventFlow 2.0 by implementing a Kanban board, calendar view, overdue task highlighting, and improved form validation.

### Duration

**Week 3 — Team Capacity: 3 members**

### Sprint 3 User Stories

* **US13:** As a user, I want to view tasks on a Kanban board so I can visualise my workflow.
* **US14:** As a user, I want a calendar view for upcoming deadlines so I can plan my schedule.
* **US15:** As a user, I want improved form validation so I enter correct and complete information.

### Sprint 3 Features

* Kanban board interface
* To Do, In Progress, and Done columns
* Movement of tasks between Kanban columns
* Calendar view for task deadlines
* Tasks displayed according to their due dates
* Overdue tasks highlighted in red
* Validation for all task forms
* Clear validation error messages
* Prevention of empty form submissions
* Final system testing
* Final project documentation
* Final release preparation

### Sprint 3 Backlog

| Task                                               | Related User Story | Assignee                    | Status     | Estimated Hours | Actual Hours |
| -------------------------------------------------- | ------------------ | --------------------------- | ---------- | --------------: | -----------: |
| Create GitHub issues for Sprint 3 features         | US13–US15          | Saamuel Kolandasamy         | Incomplete |          1 hour |            — |
| Create the Sprint 3 milestone                      | US13–US15          | Saamuel Kolandasamy         | Incomplete |          1 hour |            — |
| Update the README with Sprint 3 documentation      | US13–US15          | Saamuel Kolandasamy         | Incomplete |         2 hours |            — |
| Create the Kanban board interface                  | US13               | Shanjana De Lerra Mahendran | Incomplete |         4 hours |            — |
| Add To Do, In Progress, and Done columns           | US13               | Shanjana De Lerra Mahendran | Incomplete |         2 hours |            — |
| Display task cards in the correct Kanban columns   | US13               | Shanjana De Lerra Mahendran | Incomplete |         2 hours |            — |
| Implement movement of tasks between Kanban columns | US13               | Shanjana De Lerra Mahendran | Incomplete |         4 hours |            — |
| Save the updated task status after movement        | US13               | Shanjana De Lerra Mahendran | Incomplete |         2 hours |            — |
| Create the calendar view interface                 | US14               | Shanjana De Lerra Mahendran | Incomplete |         4 hours |            — |
| Display tasks according to their due dates         | US14               | Shanjana De Lerra Mahendran | Incomplete |         3 hours |            — |
| Highlight overdue tasks in red                     | US14               | Shanjana De Lerra Mahendran | Incomplete |       1.5 hours |            — |
| Improve validation for task forms                  | US15               | Shanjana De Lerra Mahendran | Incomplete |       2.5 hours |            — |
| Add clear validation error messages                | US15               | Shanjana De Lerra Mahendran | Incomplete |       1.5 hours |            — |
| Prevent empty task submissions                     | US15               | Shanjana De Lerra Mahendran | Incomplete |          1 hour |            — |
| Review the acceptance criteria for US13 to US15    | US13–US15          | Tharany A/P Jayakumar       | Incomplete |         2 hours |            — |
| Define and finalise user stories and backlog requirements    | US13–US15          | Tharany A/P Jayakumar       | Incomplete |         2 hours |            — |
| Test the Kanban board and task movement            | US13               | Tharany A/P Jayakumar       | Incomplete |         2 hours |            — |
| Test the calendar view and overdue highlighting    | US14               | Tharany A/P Jayakumar       | Incomplete |         2 hours |            — |
| Test form validation and error messages            | US15               | Tharany A/P Jayakumar       | Incomplete |       1.5 hours |            — |
| Prepare the Sprint 3 stand-up meeting summaries    | US13–US15          | Tharany A/P Jayakumar       | Incomplete |       1.5 hours |            — |
| Conduct the final product review and approval      | US13–US15          | Tharany A/P Jayakumar       | Incomplete |         2 hours |            — |
| Conduct the final GitHub and code review           | US13–US15          | Saamuel Kolandasamy         | Incomplete |         2 hours |            — |
| Create the final release tag                       | US13–US15          | Saamuel Kolandasamy         | Incomplete |       1.5 hours |            — |

### Sprint 3 Acceptance Criteria

#### US13 — Kanban Board View

* The Kanban board displays three columns: To Do, In Progress, and Done.
* Task cards are displayed in the correct column according to their status.
* Users can move tasks between the Kanban columns.
* The updated task status is saved after a task is moved.

#### US14 — Calendar View

* The calendar displays tasks according to their due dates.
* Users can identify upcoming task deadlines.
* Overdue tasks are highlighted in red.
* Task deadline information is displayed correctly.

#### US15 — Improved Form Validation

* All required task fields are validated.
* Empty forms cannot be submitted.
* Clear error messages are displayed when information is missing or incorrect.
* Valid task information can be submitted successfully.

### Definition of Done — Sprint 3

* The Kanban board contains To Do, In Progress, and Done columns.
* Task cards appear in the correct Kanban columns.
* Users can move tasks between the Kanban columns.
* Task status changes are stored correctly.
* The calendar displays tasks according to their due dates.
* Overdue tasks are highlighted in red.
* All required form fields are validated.
* Clear validation error messages are displayed.
* Empty task submissions are prevented.
* The acceptance criteria for US13, US14, and US15 are satisfied.
* All Sprint 3 features are tested.
* No major console errors remain.
* README documentation is complete and updated.
* All related GitHub issues are closed.
* All pull requests are reviewed and merged into the `main` branch.
* The final release tag is created.

---

# Iterative and Incremental Development

EventFlow 2.0 applies iterative and incremental development by building the final application in three stages.

In **Sprint 1**, the team transfers and reviews the basic EventFlow features from the previous assignment. These features include user registration, login, task creation, task viewing, editing, and deletion.

In **Sprint 2**, the application is improved by adding task priority and Firebase database integration. Users can assign priorities to tasks, sort tasks according to importance, and permanently store their task information.

In **Sprint 3**, advanced features are introduced. These features include a Kanban board, calendar view, overdue task highlighting, and improved form validation.

This development approach allows the team to complete the application step by step. Each sprint produces a working version of the system and allows the team to review and test the features before moving to the next iteration.

---

# Task Allocation

| Team Member                 | Role          | Sprint 1 Tasks                                                                  | Sprint 2 Tasks                                                                                      | Sprint 3 Tasks                                                                                     |
| --------------------------- | ------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Tharany A/P Jayakumar       | Product Owner | Define user stories, prioritise backlog, and review core features               | Review US11 and US12 acceptance criteria, test database persistence, and prepare stand-up summaries | Review US13 to US15, test Kanban, calendar, and validation, and approve the final product          |
| Shanjana De Lerra Mahendran | Developer     | Review login, registration, and task management features                        | Implement Firebase integration, CRUD operations, task priority, colour labels, and priority sorting | Implement Kanban board, calendar view, overdue highlighting, and form validation                   |
| Saamuel Kolandasamy         | Scrum Master  | Set up repository, transfer files, create Project Board, milestones, and labels | Create issues and milestone, update README, and support GitHub management                           | Set up final repository, Create issues and milestone, review GitHub activity, update documentation, and create release tags |

---

# GitHub Collaboration Strategy

The team uses GitHub to manage source code, divide responsibilities, monitor progress, and maintain evidence of team collaboration.

The GitHub features used in this project include:

* GitHub repository
* GitHub Issues
* GitHub Project Board
* Feature branches
* Pull requests
* Milestones
* Releases and tags
* Commit history

---

## Branching Strategy

The `main` branch is used as the stable version of EventFlow 2.0.

Each new feature is developed in a separate feature branch before being merged into the `main` branch.

Example feature branches:

* `firebase-integration`
* `firebase-crud`
* `task-priority`
* `priority-sorting`
* `kanban-board`
* `kanban-task-movement`
* `calendar-view`
* `overdue-task-highlight`
* `form-validation`
* `readme-documentation`

After a feature is completed, a pull request is created. Another team member reviews the changes before the feature branch is merged into `main`.

---

# GitHub Issues

A separate GitHub issue is created for each major feature, user story, or development task.

Example GitHub issues:

* Set up the EventFlow 2.0 repository
* Transfer previous EventFlow features
* Create GitHub Project Board
* Define and finalise new user stories
* Prioritise the product backlog
* Create project milestones
* Configure Firebase database
* Implement Firebase Create operation
* Implement Firebase Read operation
* Implement Firebase Update operation
* Implement Firebase Delete operation
* Add task priority options
* Add colour-coded priority labels
* Implement task priority sorting
* Build Kanban board view
* Implement task movement between Kanban columns
* Build calendar deadline view
* Highlight overdue tasks
* Improve task form validation
* Update README documentation
* Conduct final system testing
* Create iteration release tags

Each issue should include:

* Clear issue title
* Short task description
* Acceptance criteria
* Assigned team member
* Priority label
* Iteration label
* Related milestone
* Current status

---

# Pull Request Workflow

The team follows the pull request workflow below:

1. Select an assigned GitHub issue.
2. Create a new feature branch.
3. Develop the assigned feature.
4. Test the feature locally.
5. Commit the changes using a clear commit message.
6. Push the feature branch to GitHub.
7. Create a pull request.
8. Link the pull request to the related GitHub issue.
9. Request another team member to review the changes.
10. Resolve any comments or requested changes.
11. Merge the pull request into the `main` branch.
12. Move the related GitHub issue to Done.

This workflow improves code quality and provides evidence that all team members participated in the project.

---

# Project Board

The team uses a GitHub Project Board to monitor the progress of every development task.

## Board Columns

* Backlog
* To Do
* In Progress
* Testing
* Done

A newly created issue begins in the **Backlog** column.

When the task is selected for a sprint, it is moved to **To Do**.

When a team member begins working on the task, it is moved to **In Progress**.

After implementation, the task is moved to **Testing**.

Once the feature passes testing and meets its acceptance criteria, it is moved to **Done**.

---

# Project Milestones

| Milestone                            | Related User Stories | Description                                                                                                            |
| ------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Iteration 1 – Minimum Viable Product | US1–US6              | Includes login, registration, task creation, task viewing, task editing, and task deletion                             |
| Iteration 2 – Feature Enhancement    | US7–US12             | Includes task status, task filtering, upcoming deadlines, dark/light mode, and logout functionality                    |
| Iteration 3 – Advanced Features      | US13–US15            | Includes dashboard, task priority, Firebase database integration, Kanban board, calendar view, and improved validation |

---

# Release Tags

The project uses release tags to show the completed working version for each iteration.

| Release Tag       | Description                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| `v1.0-iteration1` | Core EventFlow features transferred and integrated into the final project           |
| `v2.0-iteration2` | task status, task filtering, upcoming deadlines, dark/light mode, and logout functionality|
| `v3.0-final`      | Kanban board, calendar view, validation, testing, task priority, firebase database features completed and final documentation completed |

---

# Testing

The team conducts functional testing after every feature is implemented.

The following functions are tested:

* User registration
* User login
* Task creation
* Task viewing
* Task editing
* Task deletion
* Task priority selection
* Priority label display
* Task priority sorting
* Firebase task storage
* Firebase Create operation
* Firebase Read operation
* Firebase Update operation
* Firebase Delete operation
* Task data persistence after page refresh
* Kanban board display
* Task movement between Kanban columns
* Calendar task display
* Overdue task highlighting
* Required field validation
* Validation error messages
* Prevention of empty form submissions

The application is tested using:

* Google Chrome
* Microsoft Edge

---

# How to Run the Project

## Step 1: Clone the Repository

```bash
git clone https://github.com/Saamuel5/EventFlow-2.0.git
```

## Step 2: Open the Project Folder

Open the cloned project folder using Visual Studio Code.

```bash
cd EventFlow-2.0
```

## Step 3: Configure Firebase

Add the Firebase configuration details to the required JavaScript configuration file.

Example Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

For security purposes, private Firebase configuration details or environment files should not be shared publicly.

## Step 4: Run the Application

For a normal HTML, CSS, and JavaScript project, open `index.html` using the Live Server extension in Visual Studio Code.

Alternatively, open the `index.html` file directly using Google Chrome or Microsoft Edge.

---

# Final Project Outcome

EventFlow 2.0 provides users with a more complete task management experience.

Users can:

* Register and log in
* Create tasks
* View tasks
* Edit tasks
* Delete tasks
* Assign task priorities
* Sort tasks based on priority
* Save tasks permanently using Firebase
* Monitor task progress using a Kanban board
* Move tasks between workflow stages
* View deadlines using a calendar
* Identify overdue tasks
* Receive validation messages when incorrect information is entered

The project demonstrates the team’s understanding of Agile Scrum, iterative development, GitHub collaboration, version control, Firebase database integration, testing, and software project documentation.
