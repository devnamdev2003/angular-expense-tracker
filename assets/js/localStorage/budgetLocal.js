const BUDGET_STORAGE_KEY = 'budget';

// Helper functions
function getBudgetFromStorage() {
    return JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY)) || [];
}

function saveBudgetToStorage(budgetList) {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetList));
}

function generateBudgetId() {
    return 'budget_' + Math.random().toString(36).substr(2, 9);
}

export const BudgetService = {
    // GET all budgets
    getAll: () => {
        return getBudgetFromStorage().sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));
    },

    // GET by ID
    getById: (id) => {
        return getBudgetFromStorage().find(b => b.id === id) || null;
    },

    // Search by date range (returns budgets falling in the range)
    search: (from, to) => {
        const all = getBudgetFromStorage();
        return all.filter(b =>
            new Date(b.fromDate) >= new Date(from) &&
            new Date(b.toDate) <= new Date(to)
        );
    },

    // ADD new budget
    add: ({ amount, fromDate, toDate }) => {
        const budgets = getBudgetFromStorage();
        const newBudget = {
            id: generateBudgetId(),
            amount,
            fromDate,
            toDate
        };
        budgets.push(newBudget);
        saveBudgetToStorage(budgets);
        return { message: 'Budget added', budget: newBudget };
    },

    // UPDATE existing budget
    update: (id, updatedData) => {
        const budgets = getBudgetFromStorage();
        const index = budgets.findIndex(b => b.id === id);
        if (index === -1) return { error: 'Budget not found' };

        budgets[index] = { ...budgets[index], ...updatedData };
        saveBudgetToStorage(budgets);
        return { message: 'Budget updated', budget: budgets[index] };
    },

    // DELETE budget
    remove: (id) => {
        let budgets = getBudgetFromStorage();
        const exists = budgets.some(b => b.id === id);
        if (!exists) return { error: 'Budget not found' };

        budgets = budgets.filter(b => b.id !== id);
        saveBudgetToStorage(budgets);
        return { message: 'Budget deleted' };
    }
};
