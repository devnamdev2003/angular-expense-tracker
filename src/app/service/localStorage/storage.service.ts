import { Injectable } from '@angular/core';
import { Categories } from './data/categories'

interface Schema {
    [key: string]: any;
}

@Injectable({
    providedIn: 'root',
})
export class StorageService {

    static readonly categoryKey = 'categories';
    static readonly expenseKey = 'expenses';
    static readonly budgetKey = 'budget';
    static readonly userKey = 'user';

    // Check if we're in the browser
    private static isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    // Sync categories with schema
    static syncCategoriesWithSchema() {
        const categorySchema: Schema = {
            category_id: "",
            name: "",
            icon: "",
            color: "",
            is_active: "",
            user_id: "",
        };

        return StorageService.syncWithSchema(StorageService.categoryKey, categorySchema);
    }

    // Sync expenses with schema
    static syncExpensesWithSchema() {
        const expenseSchema: Schema = {
            expense_id: "",
            category_id: "",
            amount: "",
            created_at: "",
            date: "",
            location: "",
            note: "",
            payment_mode: "",
            time: "",
            user_id: "",
        };

        return StorageService.syncWithSchema(StorageService.expenseKey, expenseSchema);
    }

    // Sync user with schema
    static syncUserWithSchema() {
        const userSchema: Schema = {
            id: "",
            backup_frequency: "",
            email: "",
            is_active: "",
            is_backup: "",
            last_backup: "",
            name: "",
            notifications: "",
            user_password: "",
            theme_mode: "",
            currency: "₹"
        };

        return StorageService.syncUser(StorageService.userKey, userSchema);
    }

    // Sync budget with schema
    static syncBudgetWithSchema() {
        const budgetSchema: Schema = {
            budget_id: "",
            amount: 0,
            fromDate: "",
            toDate: "",
            user_id: "",
        };

        return StorageService.syncWithSchema(StorageService.budgetKey, budgetSchema);
    }

    // Helper function for syncing with schema
    static syncWithSchema(storageKey: string, defaultSchema: Schema) {
        if (!StorageService.isBrowser()) {
            console.error('localStorage is not available in this environment.');
            return;
        }

        let savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (storageKey === StorageService.categoryKey) {
            savedData = Categories;
        }

        const schemaKeys = Object.keys(defaultSchema);
        const updatedData = savedData.map((item: Schema) => {
            const synced: Schema = {};

            schemaKeys.forEach((key: string) => {
                synced[key] = key in item ? item[key] : defaultSchema[key];
            });

            return synced;
        });

        localStorage.setItem(storageKey, JSON.stringify(updatedData));
    }

    static syncUser(storageKey: string, defaultSchema: Schema) {
        if (!StorageService.isBrowser()) {
            console.error('localStorage is not available in this environment.');
            return;
        }

        const savedSettings = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const schemaKeys = Object.keys(defaultSchema);

        const syncedSettings: Schema = {};

        schemaKeys.forEach((key: string) => {
            syncedSettings[key] = key in savedSettings ? savedSettings[key] : defaultSchema[key];
        });

        localStorage.setItem(StorageService.userKey, JSON.stringify(syncedSettings));
    }

    getAllCategories() {
        return JSON.parse(localStorage.getItem(StorageService.categoryKey) || '[]');
    }

    getAllBudgets() {
        return JSON.parse(localStorage.getItem(StorageService.budgetKey) || '[]');
    }

    getUser() {
        return JSON.parse(localStorage.getItem(StorageService.userKey) || '{}');
    }

    getAllExpenses() {
        return JSON.parse(localStorage.getItem(StorageService.expenseKey) || '[]');
    }

}
