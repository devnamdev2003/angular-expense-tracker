const EXPENSE_STORAGE_KEY = 'expenses';
const CATEGORY_STORAGE_KEY = 'categories';

function getExpensesFromStorage() {
  return JSON.parse(localStorage.getItem(EXPENSE_STORAGE_KEY)) || [];
}

function saveExpensesToStorage(expenses) {
  localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
}

function getCategoriesFromStorage() {
  return JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || [];
}

function generateExpenseId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export const ExpenseService = {
  // GET all expenses (joined with category)
  getAll: () => {
    const expenses = getExpensesFromStorage();
    const categories = getCategoriesFromStorage();

    return expenses
      .map(e => {
        const cat = categories.find(c => c.category_id === e.category_id) || {};
        return { ...e, category_name: cat.name, icon: cat.icon, color: cat.color };
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
      });
  },

  // GET by ID
  getById: (id) => {
    const expense = getExpensesFromStorage().find(e => e.expense_id === id);
    if (!expense) return null;

    const cat = getCategoriesFromStorage().find(c => c.category_id === expense.category_id) || {};
    return { ...expense, category_name: cat.name, icon: cat.icon, color: cat.color };
  },

  // Search by date range
  search: (from, to) => {
    const expenses = getExpensesFromStorage();
    const categories = getCategoriesFromStorage();

    const result = expenses.filter(e => e.date >= from && e.date <= to);

    return result
      .map(e => {
        const cat = categories.find(c => String(c.category_id) === String(e.category_id)) || {};
        return {
          ...e,
          category_name: cat.name || 'Unknown',
          icon: cat.icon || '',
          color: cat.color || ''
        };
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
      });
  },

  // POST new expense
  add: ({ amount, category_id, subcategory, date, time, note, payment_mode, location }) => {
    const expenses = getExpensesFromStorage();
    const newExpense = {
      expense_id: generateExpenseId(),
      amount,
      category_id,
      subcategory,
      date,
      time,
      note,
      payment_mode,
      location,
    };
    expenses.push(newExpense);
    saveExpensesToStorage(expenses);
    return { "message": 'Expense added' };
  },

  // PUT update expense
  update: (id, updatedData) => {
    const expenses = getExpensesFromStorage();
    const index = expenses.findIndex(e => e.expense_id === id);
    if (index === -1) return null;

    expenses[index] = { ...expenses[index], ...updatedData };
    saveExpensesToStorage(expenses);
    return expenses[index];
  },

  // DELETE expense
  remove: (id) => {
    let expenses = getExpensesFromStorage();
    const exists = expenses.some(e => String(e.expense_id) === String(id));

    if (!exists) {
      return { error: 'Expense not found' }; // mimic a 404 error-like response
    }

    expenses = expenses.filter(e => String(e.expense_id) !== String(id));
    saveExpensesToStorage(expenses);

    return { message: 'Expense deleted' };
  }

};