// localCategoryService.js
const EXPENSE_STORAGE_KEY = 'expenses';
const CATEGORY_STORAGE_KEY = 'categories';
const CUSTOM_CATEGORY_STORAGE_KEY = 'custom_categories';

// Utility to get categories from localStorage
function getCutomCategoriesFromStorage() {
  return JSON.parse(localStorage.getItem(CUSTOM_CATEGORY_STORAGE_KEY)) || [];
}

// Utility to get categories from localStorage
function getDefaultCategoriesFromStorage() {
  return JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || [];
}

function getlastCategoryId() {
  const cat = getCategoriesFromStorage();
  const size = cat.length;
  return cat[size - 1].category_id;

}
// Utility to get all categories (default + custom) from localStorage
function getCategoriesFromStorage() {
  const defaultCategories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || [];
  const customCategories = JSON.parse(localStorage.getItem(CUSTOM_CATEGORY_STORAGE_KEY)) || [];
  return [...defaultCategories, ...customCategories];
}

// Utility to save categories to localStorage
function saveCategoriesToStorage(categories) {
  localStorage.setItem(CUSTOM_CATEGORY_STORAGE_KEY, JSON.stringify(categories));
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
    const categories = getCutomCategoriesFromStorage();
    const newCategory = {
      category_id: getlastCategoryId() + 1,
      name,
      icon,
      color
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
    let categories = getCutomCategoriesFromStorage();
    const exists = categories.some(c => c.category_id === id);
    categories = categories.filter(c => c.category_id !== id);
    saveCategoriesToStorage(categories);
    return exists;
  },

  getDefault: () => {
    return getDefaultCategoriesFromStorage();
  }
};

