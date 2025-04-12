

## ✅ **Test Sheet: Calendar View Section**

| Test Case ID | Test Case Description | Steps | Expected Result | Status |
|--------------|------------------------|-------|------------------|--------|
| TC-Cal-01 | Load current month calendar | Navigate to Calendar tab | Calendar displays current month with days | ⬜ |
| TC-Cal-02 | Click on a date with expenses | Click a day cell with known expenses | Modal opens showing expenses for that day | ⬜ |
| TC-Cal-03 | Click on a date with no expenses | Click a day cell with no expenses | Modal shows "No expenses found for this date." | ⬜ |
| TC-Cal-04 | Navigate to previous/next month | Click "Previous Month" and "Next Month" | Calendar updates correctly | ⬜ |
| TC-Cal-05 | Validate total expenses of month | Load calendar for a month with expenses | Top label shows correct `Total Expenses: ₹amount` | ⬜ |
| TC-Cal-06 | Modal Close | Click close (×) in modal | Modal disappears and content is cleared | ⬜ |
| TC-Cal-07 | Today’s date highlight | Load current month | Today’s date is highlighted with different styling | ⬜ |
| TC-Cal-08 | Visual overflow check | Fill month with many expenses, open modal | Modal content scrolls, no overflow | ⬜ |
| TC-Cal-09 | Responsive grid layout | Test on smaller screens | Grid and modal are responsive | ⬜ |

