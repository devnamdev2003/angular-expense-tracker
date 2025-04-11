import { ExpenseService } from './localStorage/expenseLocal.js';
import { CategoryService } from './localStorage/categoryLocal.js';

document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const from = document.getElementById('fromDate').value;
    const to = document.getElementById('toDate').value;
    if (new Date(from) > new Date(to)) {
        showToast("To date must be after from date.", "warning");
        return;
    }

    try {
        const expenses = ExpenseService.search(from, to);
        const categories = CategoryService.getAll();
        const categoryMap = Object.fromEntries(categories.map(c => [c.category_id, c.name]));

        const resultList = document.getElementById("searchResultsList");
        resultList.innerHTML = ""; // Clear previous results

        expenses.forEach(exp => {
            const item = document.createElement('li');
            item.className = 'bg-surface dark:bg-[color:var(--color-surface)] rounded-lg p-4 shadow-md mb-3';

            const expDate = new Date(exp.date);
            const time = exp.time || '00:00:00';
            const formattedDate = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')}`;
            const dateTime = `${formattedDate} ${time}`;

            item.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <span class="text-lg font-semibold text-green-600 dark:text-green-400">₹${exp.amount}</span>
      <span class="text-sm text-color-text">${categoryMap[exp.category_id] || 'Uncategorized'}</span>
    </div>
    <div class="text-sm space-y-1 text-color-text">
      <div class="flex justify-between">
        <div><strong>Date:</strong> ${dateTime}</div>
        ${exp.payment_mode ? `<div><strong>Payment Mode:</strong> ${exp.payment_mode}</div>` : ''}
      </div>
      ${exp.subcategory ? `<div><strong>Subcategory:</strong> ${exp.subcategory}</div>` : ''}
      ${exp.note ? `<div><strong>Note:</strong> ${exp.note}</div>` : ''}
      ${exp.location ? `<div><strong>Location:</strong> ${exp.location}</div>` : ''}
    </div>
            `;

            resultList.appendChild(item);
        });
        if (expenses.length === 0) {
            showToast("No expenses found for the selected date range.", "info");
        }

    } catch (error) {
        console.error("Search failed:", error);
        showToast("Failed to search expenses. Try again.", "error");
    }
});
