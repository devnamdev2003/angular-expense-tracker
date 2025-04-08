import { ExpenseService } from './localStorage/expenseLocal.js';

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function calculateTotalExpenses(fromDate, toDate) {
    const monthTotal = document.getElementById('monthTotal');
    try {
        const data = ExpenseService.search(fromDate, toDate)

        let total = 0;
        if (Array.isArray(data)) {
            total = data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        }
        monthTotal.textContent = `Total Expenses: ₹${total.toFixed(2)}`;
    } catch (e) {
        console.error("Failed to fetch monthly data:", e);
        monthTotal.textContent = `Total Expenses: ₹0.00`;
    }
}

function renderCalendar(year, month) {
    const calendarGrid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');
    calendarGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate(); // days in previous month
    const monthStr = String(month + 1).padStart(2, '0');
    title.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

    const fromDate = `${year}-${monthStr}-01`;
    const toDate = `${year}-${monthStr}-${daysInMonth}`;
    calculateTotalExpenses(fromDate, toDate)

    // 🟡 Fill days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const div = document.createElement('div');
        div.className = 'text-gray-500 bg-surface opacity-50 p-2 rounded';
        div.textContent = day;
        calendarGrid.appendChild(div);
    }

    // 🟢 Fill current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
        const div = document.createElement('div');
        div.className = 'text-color bg-surface p-2 rounded cursor-pointer dayCell-list-item';
        div.textContent = day;

        // Highlight today
        const today = new Date();
        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            div.classList.remove('dayCell-list-item');
            div.classList.add('bg-accent', 'text-white', 'font-bold');
        }

        div.addEventListener('click', () => openModal(dateStr));
        calendarGrid.appendChild(div);
    }

    // 🔵 Fill next month's days to complete the week
    const totalCells = firstDay + daysInMonth;
    const nextDays = 7 - (totalCells % 7);
    if (nextDays < 7) {
        for (let i = 1; i <= nextDays; i++) {
            const div = document.createElement('div');
            div.className = 'text-gray-500 bg-surface opacity-50 p-2 rounded';
            div.textContent = i;
            calendarGrid.appendChild(div);
        }
    }
}

window.changeMonth = (offset) => {
    currentMonth += offset;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
}

window.closeModal = () => {
    const modal = document.getElementById('dayModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('modalExpenseList').innerHTML = '';
}

function openModal(dateStr) {
    try {
        const expenses = ExpenseService.search(dateStr, dateStr)

        const modal = document.getElementById('dayModal');
        const modalTitle = document.getElementById('modalTitle');
        const expenseList = document.getElementById('modalExpenseList');

        modalTitle.textContent = `Expenses on ${dateStr}`;
        expenseList.innerHTML = ''; // Clear old content

        if (!Array.isArray(expenses) || expenses.length === 0) {
            expenseList.innerHTML = `<p class="text-gray-500">No expenses found for this date.</p>`;
        } else {
            expenses.forEach(exp => {
                const item = document.createElement('li');
                item.className = 'bg-surface rounded-lg p-4 shadow-md';
                item.innerHTML = `
  <div class="flex justify-between items-center mb-2">
    <span class="text-lg font-semibold text-green-600 dark:text-green-400">₹${exp.amount}</span>
    <span class="text-sm">${exp.category_name || 'Uncategorized'}</span>
  </div>
  <div class="text-sm space-y-1">
    <div><strong>Time:</strong> ${exp.time}</div>
    ${exp.note ? `<div><strong>Note:</strong> ${exp.note}</div>` : ''}
    ${exp.location ? `<div><strong>Location:</strong> ${exp.location}</div>` : ''}
    ${exp.payment_mode ? `<div><strong>Payment Mode:</strong> ${exp.payment_mode}</div>` : ''}
  </div>
`;

                expenseList.appendChild(item);
            });
        }

        // ✅ Fix: Make it visible by adding flex and removing hidden
        modal.classList.remove('hidden');
        modal.classList.add('flex');

    } catch (err) {
        console.error('Error loading expenses for date:', err);
    }
}

export { renderCalendar };