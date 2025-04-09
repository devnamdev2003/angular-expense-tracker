/* ----------------------------categories------------------------ */
localStorage.setItem('categories', JSON.stringify([
    { category_id: 1, name: 'Food & Drinks', icon: '🍔', color: '#f94144' },
    { category_id: 2, name: 'Groceries', icon: '🥦', color: '#f3722c' },
    { category_id: 3, name: 'Shopping', icon: '🛍️', color: '#f9844a' },
    { category_id: 4, name: 'Bills & Utilities', icon: '💡', color: '#f9c74f' },
    { category_id: 5, name: 'Entertainment', icon: '🎬', color: '#90be6d' },
    { category_id: 6, name: 'Health', icon: '💊', color: '#43aa8b' },
    { category_id: 7, name: 'Education', icon: '🎓', color: '#577590' },
    { category_id: 8, name: 'Subscriptions', icon: '📺', color: '#277da1' },
    { category_id: 9, name: 'Travel', icon: '✈️', color: '#8e44ad' },
    { category_id: 10, name: 'Rent', icon: '🏠', color: '#34495e' },
    { category_id: 11, name: 'Family & Friends', icon: '👨‍👩‍👧‍👦', color: '#3498db' },
    { category_id: 12, name: 'Miscellaneous', icon: '📌', color: '#bdc3c7' },
    { category_id: 13, name: 'Gifts', icon: '🎁', color: '#c0392b' },
    { category_id: 14, name: 'Party', icon: '🥳', color: '#e67e22' },
    { category_id: 15, name: 'Personal Care', icon: '🧴', color: '#9b59b6' },
    { category_id: 16, name: 'Home & Hygiene', icon: '🧼', color: '#2ecc71' }

]));

/* ---------------------------categories----------------------- */
/* -------------------------------------------------------------- */
/* ----------------------------settings------------------------ */

const settingsSchema = {
    themeMode: "",
    notifications: true,
    language: "",
    currency: "",
    layout: "",
};

function syncSettingsWithSchema() {
    const savedSettings = JSON.parse(localStorage.getItem('settings')) || {};
    const schemaKeys = Object.keys(settingsSchema);

    const syncedSettings = {};

    // Add new keys & retain valid existing ones
    schemaKeys.forEach(key => {
        syncedSettings[key] = key in savedSettings ? savedSettings[key] : settingsSchema[key];
    });

    localStorage.setItem('settings', JSON.stringify(syncedSettings));
}
/* ----------------------------settings------------------------ */
/* -------------------------------------------------------------- */
/* ----------------------------expenses------------------------ */

if (!localStorage.getItem('expenses')) {
    localStorage.setItem('expenses', JSON.stringify([]));
}

const expenseSchema = {
    amount: "",
    category_id: "",
    date: "",
    expense_id: "",
    location: "",
    note: "",
    payment_mode: "",
    subcategory: "",
    time: "",
};

function syncExpensesWithSchema() {
    const schemaKeys = Object.keys(expenseSchema);
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const updatedExpenses = expenses.map(exp => {
        const synced = {};

        // Add or update fields to match schema
        schemaKeys.forEach(key => {
            synced[key] = key in exp ? exp[key] : expenseSchema[key];
        });

        return synced;
    });

    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
}

/* ----------------------------categories------------------------ */
/* -------------------------------------------------------------- */
/* -------------------------custom_categories-------------------- */

if (!localStorage.getItem('custom_categories')) {
    localStorage.setItem('custom_categories', JSON.stringify([]));
}

const customCategorySchema = {
    category_id: "",
    name: "",
    icon: "",
    color: "",
};

function syncCustomCategoriesWithSchema() {
    const schemaKeys = Object.keys(customCategorySchema);
    let customCategories = JSON.parse(localStorage.getItem('custom_categories')) || [];

    const updatedCategories = customCategories.map(cat => {
        const synced = {};
        schemaKeys.forEach(key => {
            synced[key] = key in cat ? cat[key] : customCategorySchema[key];
        });
        return synced;
    });

    localStorage.setItem('custom_categories', JSON.stringify(updatedCategories));
}
/* ----------------------------custom_categories------------------------ */
/* --------------------------------------------------------------------- */

export { syncExpensesWithSchema, syncSettingsWithSchema, syncCustomCategoriesWithSchema };