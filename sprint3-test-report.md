# Sprint 3 Test Report — EventFlow 2.0
## Iteration 3: Advanced Features (Firebase, Priority, Kanban, Calendar, Validation)

**Tested by:** Tharany A/P Jayakumar (Product Owner)

**Sprint Duration:** Week 3 (7 days)

**Release Tag:** v1.2-iteration3

---

## 1. Scope of Testing
User stories delivered and tested this sprint:

| ID | Feature | Points |
|---|---|---|
| US11 | Task priority labels (High/Medium/Low) | 5 |
| US12 | Firebase database persistence | 13 |
| US13 | Kanban board view | 8 |
| US14 | Calendar view for deadlines | 8 |
| US15 | Improved form validation | 5 |

---

## 2. Test Cases and Results

| Test Case | Feature | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | Firebase read/write | Create a task, refresh the page | Task persists after refresh | Task persisted correctly | ✅ Pass |
| TC-02 | Firebase CRUD | Create, update, delete a task | All 3 operations reflect in Firebase console in real time | Confirmed working end-to-end | ✅ Pass |
| TC-03 | Priority assignment | Set a task's priority to High/Medium/Low | Colour-coded label appears on task card | Labels displayed and colour coded correctly | ✅ Pass |
| TC-04 | Priority sorting | Sort task list by priority | Tasks reorder by High → Medium → Low | Sorting worked as expected | ✅ Pass |
| TC-05 | Kanban board render | Switch from table view to Kanban view | Board shows In Progress / Completed / Overdue columns | Columns displayed correctly | ✅ Pass |
| TC-06 | Kanban drag-and-drop | Move a task card between columns | Task status updates and saves | Status updated and persisted after move | ✅ Pass |
| TC-07 | Calendar rendering | Open calendar view | Tasks appear on their due dates | Tasks displayed correctly by date | ✅ Pass |
| TC-08 | Overdue highlighting | View an overdue task on the calendar | Task highlighted in red | Highlighted red as expected | ✅ Pass |
| TC-09 | Form validation — empty fields | Submit a task form with an empty title | Submission blocked, error shown | Blocked with clear error message | ✅ Pass |
| TC-10 | Form validation — invalid deadline | Enter a past date as deadline | Submission blocked, error shown | Blocked correctly | ✅ Pass |
| TC-11 | Cross-browser check | Load app in Chrome, Edge, Firefox | No console errors, layout consistent | No errors found in any browser | ✅ Pass |

**Result: 11/11 test cases passed.**

---

## 3. Bugs Found

| Bug ID | Description | Severity | Status |
|---|---|---|---|
| BUG-3.1 | Minor UI misalignment on Kanban card labels | Low | ✅ Fixed before sprint end |
| BUG-3.2 | Calendar overdue highlight briefly not updating on same-day tasks | Low | ✅ Fixed before sprint end |

**Total bugs found:** 2 · **Total bugs fixed:** 2/2 (100%)

---

## 4. Quality Metrics Summary

| Metric | Result |
|---|---|
| Features delivered | 5/5 user stories ✅ |
| Story points delivered | 39/39 (100%) |
| Bugs found | 2 (both minor) |
| Bugs fixed before sprint close | 2/2 ✅ |
| Pull requests submitted | 5+ |
| Pull requests reviewed | All reviewed ✅ |
| Browser compatibility | Chrome ✅ Edge ✅ Firefox ✅ |
| Console errors | None found ✅ |
| Definition of Done met | ✅ Yes |

---

## 5. Definition of Done — Verification

- [x] Kanban board fully functional
- [x] Calendar view working
- [x] All forms validated
- [x] No bugs found in final testing pass
- [x] All PRs merged
- [x] Release tag v1.2-iteration3 created
- [x] System ready for presentation/demo


## Test Environment

| Item | Details |
|------|---------|
| Tester | Tharany A/P Jayakumar |
| Browsers Tested | Google Chrome, Microsoft Edge, Mozilla Firefox |
| Testing Type | Manual Functional Testing |
| Device | Laptop |

---

## 6. Conclusion
All 5 Sprint 3 user stories (US11–US15) passed testing with no outstanding bugs. Firebase integration, Kanban board, calendar view, and form validation are all confirmed stable across Chrome, Edge, and Firefox. Sprint 3 goal was fully met and the system is demo-ready.
