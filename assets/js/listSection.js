import { ExpenseService } from './localStorage/expenseLocal.js';
import { CategoryService } from './localStorage/categoryLocal.js';

let expenses = [];

function listSection() {
    try {
        expenses = ExpenseService.getAll();
        const categories = CategoryService.getAll();

        // Map category_id to category name for easy lookup
        const categoryMap = Object.fromEntries(
            categories.map((c) => [c.category_id, c.name])
        );

        const tbody = document.getElementById("expenseTableBody");
        tbody.innerHTML = "";

        expenses.forEach((expense, index) => {
            const tr = document.createElement("tr");
            const expDate = new Date(expense.date);
            let expDateTime = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')} ${expense.time.split(":")[0]}:${expense.time.split(":")[1]}:${expense.time.split(":")[2]}`;

            tr.className =
                "border-b dark:border-gray-700 expense-list-item transition";

            tr.innerHTML = `
        <td class="px-4 py-3 font-semibold text-color-text whitespace-nowrap">₹${expense.amount}</td>
        <td class="px-4 py-3 whitespace-nowrap">${categoryMap[expense.category_id] || "N/A"}</td>
        <td class="px-4 py-3 whitespace-nowrap">${expense.subcategory || "-"}</td>
        <td class="px-4 py-3 whitespace-nowrap">${expDateTime}</td>
        <td class="px-4 py-3 whitespace-nowrap">${expense.payment_mode}</td>
        <td class="px-4 py-3 whitespace-nowrap">
          <button 
            onclick="confirmDelete('${expense.expense_id}')"
            class="text-red-500 hover:underline flex items-center gap-1"
          >
            🗑️ <span>Delete</span>
          </button>
        </td>
      `;

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Failed to load expenses:", err);
    }
}

let sortDirections = {};

window.sortTable = (colIndex) => {
    const table = document.getElementById("expenseTable");
    const tbody = document.getElementById("expenseTableBody");
    const rows = Array.from(tbody.rows);

    // Toggle sort direction for the column
    sortDirections[colIndex] = !sortDirections[colIndex];
    const direction = sortDirections[colIndex] ? 1 : -1;

    const sorted = rows.sort((a, b) => {
        let valA = a.cells[colIndex].innerText.trim();
        let valB = b.cells[colIndex].innerText.trim();

        // Check if value looks like a date (yyyy-mm-dd or dd/mm/yyyy or similar)
        const dateA = Date.parse(valA);
        const dateB = Date.parse(valB);

        const isDate = !isNaN(dateA) && !isNaN(dateB);

        if (isDate) {
            return direction * (new Date(dateA) - new Date(dateB));
        }

        // Fallback: Check if numeric
        const numA = parseFloat(valA.replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(valB.replace(/[^0-9.-]+/g, ""));
        const isNumeric = !isNaN(numA) && !isNaN(numB);

        if (isNumeric) {
            return direction * (numA - numB);
        }

        // String comparison
        return direction * valA.toLowerCase().localeCompare(valB.toLowerCase(), undefined, { numeric: true });
    });

    tbody.innerHTML = "";
    sorted.forEach(row => tbody.appendChild(row));
}

window.confirmDelete = (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
        const result = ExpenseService.remove(id);

        if (result.error) {
            console.error("Error:", result.error);
            showToast(result.error || 'Something went wrong while deleting the expense.', 'error');
        } else {
            showToast(result.message || "Expense deleted successfully", 'success');
            listSection(); // Refresh the expense list
        }
    }
};

export { listSection };