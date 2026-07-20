# Sprint 3 Test Report — EventFlow 2.0
## Iteration 3: Advanced Features (Firebase, Priority, Kanban, Calendar, Validation)

**Tested by:** Saamuel Kolandasamy (Scrum Master)

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
| Tester | Saamuel Kolandasamy |
| Browsers Tested | Google Chrome, Microsoft Edge, Mozilla Firefox |
| Testing Type | Manual Functional Testing |
| Device | Windows 11 Laptop |

---

## 6. Conclusion
All five Sprint 3 user stories, US11 to US15, were successfully completed and passed all planned test cases with no outstanding bugs. The testing confirmed that Firebase data persistence and CRUD operations are working correctly, task priority labels and sorting function as expected, and the Kanban board allows users to view and move tasks between different status columns. The calendar view correctly displays tasks according to their due dates and highlights overdue tasks in red. Improved form validation also prevents empty or invalid submissions and provides clear error messages to users.

The system was tested across Google Chrome, Microsoft Edge, and Mozilla Firefox. All major features worked consistently in each browser, with no browser-specific issues, major layout problems, or console errors found during the final testing process. The minor bugs identified earlier in the sprint were fixed and retested before the sprint was closed.

Overall, all Sprint 3 acceptance criteria and Definition of Done requirements were achieved. All related pull requests were reviewed and merged, the final documentation was updated, and release tag `v1.2-iteration3` was created. Therefore, the Sprint 3 goal was fully met, and EventFlow 2.0 is stable, complete, and ready for the final presentation and system demonstration.
