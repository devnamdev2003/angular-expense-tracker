import { Injectable } from '@angular/core';
import { Categories } from './data/categories';
import { AppVersionService } from '../util/app-version/app-version.service';

interface Schema {
    [key: string]: any;
}

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    constructor(private appVersionService: AppVersionService) {
    }
    
    private readonly categoryKey = 'categories';
    private readonly expenseKey = 'expenses';
    private readonly budgetKey = 'budget';
    private readonly userKey = 'user';

    // Check if we're in the browser
    private static isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    // Sync categories with schema
    syncCategoriesWithSchema() {
        const categorySchema: Schema = {
            category_id: "",
            name: "",
            icon: "",
            color: "",
            is_active: "",
            user_id: ""
        };

        return this.syncWithSchema(this.categoryKey, categorySchema);
    }

    // Sync expenses with schema
    syncExpensesWithSchema() {
        const expenseSchema: Schema = {
            expense_id: "",
            category_id: "",
            amount: "",
            date: "",
            location: "",
            note: "",
            payment_mode: "",
            time: "",
            isExtraSpending: false
        };

        return this.syncWithSchema(this.expenseKey, expenseSchema);
    }

    // Sync user with schema
    syncUserWithSchema() {
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
            theme_mode: "dark",
            currency: "₹",
            app_version: "0",
            is_app_updated: true
        };

        return this.syncUser(this.userKey, userSchema);
    }

    // Sync budget with schema
    syncBudgetWithSchema() {
        const budgetSchema: Schema = {
            budget_id: "",
            amount: 0,
            fromDate: "",
            toDate: ""
        };

        return this.syncWithSchema(this.budgetKey, budgetSchema);
    }

    // Helper function for syncing with schema
    syncWithSchema(storageKey: string, defaultSchema: Schema) {
        if (!StorageService.isBrowser()) {
            console.error('localStorage is not available in this environment.');
            return;
        }

        let savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (storageKey === this.categoryKey) {
            const pastData = JSON.parse(localStorage.getItem(this.categoryKey) || '[]');
            const filteredPastData = pastData.filter((item: any) => item.user_id !== "0");
            savedData = [...filteredPastData, ...Categories];
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

    syncUser(storageKey: string, defaultSchema: Schema) {
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
        syncedSettings['app_version'] = this.appVersionService.getVersion();

        localStorage.setItem(this.userKey, JSON.stringify(syncedSettings));
    }

    getAllCategories() {
        return JSON.parse(localStorage.getItem(this.categoryKey) || '[]');
    }

    getAllBudgets() {
        return JSON.parse(localStorage.getItem(this.budgetKey) || '[]');
    }

    getUser() {
        return JSON.parse(localStorage.getItem(this.userKey) || '{}');
    }

    getAllExpenses() {
        return JSON.parse(localStorage.getItem(this.expenseKey) || '[]');
    }

    getCategoryKey(): string {
        return this.categoryKey;
    }

    getExpenseKey(): string {
        return this.expenseKey;
    }

    getBudgetKey(): string {
        return this.budgetKey;
    }

    getUserKey(): string {
        return this.userKey;
    }

}
