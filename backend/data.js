const categoriesSchema = {
    category_id: Number,
    name: String,
    icon: String,
    color: String
};

const settingsSchema = {
    settings_id: String,
    themeMode: String,
    notifications: true,
    backupFrequency: String,
    isBackup: false,
    user_email: String,
    user_password: String,
    lastBackup: Date
};

const expensesSchema = {
    expense_id: String,
    amount: Number,
    date: Date,
    location: String,
    note: String,
    payment_mode: String,
    subcategory: String,
    time: Date,
    category_id: Number,
};

const custom_categoriesSchema = {
    category_id: Number,
    name: "",
    icon: "",
    color: "",
};

const budgetSchema = {
    budget_id: String,
    amount: Number,
    fromDate: Date,
    toDate: Date,
};

