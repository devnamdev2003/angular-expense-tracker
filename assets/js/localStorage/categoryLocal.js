// localCategoryService.js
const EXPENSE_STORAGE_KEY = 'expenses';
const CATEGORY_STORAGE_KEY = 'categories';

// Utility to get categories from localStorage
function getCategoriesFromStorage() {
  return JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || [];
}

// Utility to save categories to localStorage
function saveCategoriesToStorage(categories) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

// Generate unique ID (simulate DB auto-increment)
function generateCategoryId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function getExpensesFromStorage() {
  return JSON.parse(localStorage.getItem(EXPENSE_STORAGE_KEY)) || [];
}
export const CategoryService = {
  // GET all categories with expense count (mocked)
  getAll: () => {
    const categories = getCategoriesFromStorage();
    const expenses = getExpensesFromStorage();

    const categoryMap = categories.map(cat => {
      const count = expenses.filter(exp => String(exp.category_id) === String(cat.category_id)).length;
      return {
        ...cat,
        expense_count: count
      };
    });

    return categoryMap.sort((a, b) => {
      if (b.expense_count !== a.expense_count) {
        return b.expense_count - a.expense_count;
      }
      return a.name.localeCompare(b.name);
    });
  },

  // GET by ID
  getById: (id) => {
    const categories = getCategoriesFromStorage();
    return categories.find(c => c.category_id === id) || null;
  },

  // POST new category
  add: ({ name, icon, color }) => {
    const categories = getCategoriesFromStorage();
    const newCategory = {
      category_id: generateCategoryId(),
      name,
      icon,
      color,
      expense_count: 0
    };
    categories.push(newCategory);
    saveCategoriesToStorage(categories);
    return newCategory;
  },

  // PUT update category
  update: (id, { name, icon, color }) => {
    const categories = getCategoriesFromStorage();
    const index = categories.findIndex(c => c.category_id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], name, icon, color };
    saveCategoriesToStorage(categories);
    return categories[index];
  },

  // DELETE category
  remove: (id) => {
    let categories = getCategoriesFromStorage();
    const exists = categories.some(c => c.category_id === id);
    categories = categories.filter(c => c.category_id !== id);
    saveCategoriesToStorage(categories);
    return exists;
  }
};

