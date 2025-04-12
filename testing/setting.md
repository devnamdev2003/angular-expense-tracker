Here's a well-structured **Testing Sheet** for your calendar-based expense tracking application. It covers functionality from the **Settings Section**, **Modals**, **Expense Calculation**, **Calendar Rendering**, and **Expense Viewing**.

---

### ✅ **TEST CASE SHEET: Expense Tracker – Settings & Calendar**

| **Test Case** | **Description**                       | **Test Steps**                                             | **Expected Result**                                       | **Pass/Fail** | **Comments** |
| ------------- | ------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- | ------------- | ------------ |
| TC001         | Toggle Dark Mode                      | 1. Go to Settings<br>2. Click the Dark Mode toggle         | UI theme switches between light and dark mode             |               |              |
| TC002         | Open Budget Modal                     | Click "Set" button in Budget section                       | Budget modal dialog should open                           |               |              |
| TC003         | Set Valid Budget                      | Fill valid From Date, To Date, and Amount → Click "Submit" | Budget should be saved and modal should close             |               |              |
| TC004         | Set Invalid Budget (Future from < to) | Fill From > To Date → Click Submit                         | Show date validation error under inputs                   |               |              |
| TC005         | Set Invalid Budget (Negative Amount)  | Enter negative or 0 in amount → Click Submit               | Show error under amount input                             |               |              |
| TC006         | Open Category Modal                   | Click “Add” in Categories section                          | Category modal should open                                |               |              |
| TC007         | Add Valid Category                    | Fill Name, Icon, Color → Submit                            | Category saved and modal closes                           |               |              |
| TC008         | Add Category with Missing Fields      | Leave fields blank → Submit                                | Show appropriate validation error messages                |               |              |
| TC009         | Open Delete Category Modal            | Click “Delete” in Categories section                       | Delete modal should open                                  |               |              |
| TC010         | Delete Existing Category              | Enter existing category name → Click Delete                | Category deleted and modal closes                         |               |              |
| TC011         | Delete Non-existing Category          | Enter invalid name → Click Delete                          | Show "category not found" error message                   |               |              |
| TC012         | Open Backup Modal                     | Click “Set” in Backup section                              | Backup modal should open                                  |               |              |
| TC013         | Set Backup Frequency                  | Select a frequency → Click Submit                          | Backup frequency saved and modal closes                   |               |              |
| TC014         | Calendar Renders Current Month        | Load application                                           | Calendar displays current month/year with correct title   |               |              |
| TC015         | Navigate to Next Month                | Click “Next” month arrow                                   | Calendar updates to next month correctly                  |               |              |
| TC016         | Navigate to Previous Month            | Click “Previous” month arrow                               | Calendar updates to previous month                        |               |              |
| TC017         | View Today's Highlight                | Check if today is visually highlighted                     | Today's cell has `bg-accent` & bold text                  |               |              |
| TC018         | Calendar Fills Previous/Next Days     | Navigate to a month starting on mid-week                   | Extra days filled to complete rows                        |               |              |
| TC019         | Click Date with No Expenses           | Click on any date with no expenses                         | Modal opens with "No expenses" message                    |               |              |
| TC020         | Click Date with Expenses              | Click on a date with expenses                              | Modal lists all expenses with correct formatting          |               |              |
| TC021         | Expense Modal Sum Check               | Check total shown in modal header                          | Sum matches total of listed amounts                       |               |              |
| TC022         | Expense List Rendering                | Click a date → Inspect each expense entry                  | All fields (amount, category, time, etc.) render properly |               |              |
| TC023         | Monthly Expense Total                 | On calendar render, check top total                        | Total matches sum of all expenses in that month           |               |              |
| TC024         | Invalid Expense Data Handling         | Simulate invalid data in storage                           | Application handles gracefully, shows ₹0.00               |               |              |
| TC025         | Modal Close Button                    | Open any modal → Click × icon                              | Modal closes without saving changes                       |               |              |

---

### 🧪 Notes:
- You can update the **Pass/Fail** and **Comments** columns during testing.
- For automated testing, consider writing unit tests using **Jest** for JS logic and **Playwright/Cypress** for UI.

Would you like me to generate a downloadable Excel/CSV version of this test sheet for you?