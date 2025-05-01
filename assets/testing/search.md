## ✅ **Test Sheet: Search Expenses Section**

| Test Case ID | Test Case Description                                              | Steps                                                                | Expected Result                                              | Status |
| ------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| TC-Search-01 | Submit with valid date range                                       | Select `From Date` and `To Date` in correct order and click `Search` | List of expenses in selected range appears                   | ⬜      |
| TC-Search-02 | Submit with `To Date` earlier than `From Date`                     | Enter a later `From Date` and an earlier `To Date`, click `Search`   | Show toast: "To date must be after from date."               | ⬜      |
| TC-Search-03 | Submit with no expenses in date range                              | Select range with no expenses and click `Search`                     | Show toast: "No expenses found for the selected date range." | ⬜      |
| TC-Search-04 | Check correct mapping of category names                            | Add expense with category, search for that date                      | Category name is shown correctly from `CategoryService`      | ⬜      |
| TC-Search-05 | Verify optional fields (subcategory, note, location, payment mode) | Add expenses with/without optional fields and search                 | Optional fields appear only when present                     | ⬜      |
| TC-Search-06 | Check date formatting in result list                               | Search any date range                                                | Date appears in `YYYY-MM-DD HH:MM:SS` format                 | ⬜      |
| TC-Search-07 | Check styling of result cards                                      | Perform any search                                                   | Cards have proper background, padding, spacing               | ⬜      |
| TC-Search-08 | Check responsive layout                                            | Open on mobile/tablet                                                | Layout adjusts to vertical stacking                          | ⬜      |

---