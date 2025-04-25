// storage.service.ts

import { Injectable } from '@angular/core';

interface Schema {
    [key: string]: any;  // Allow indexing with string keys
}

@Injectable({
    providedIn: 'root',
})
export class StorageService {

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

        return StorageService.syncWithSchema('categories', categorySchema);
    }

    // Sync expenses with schema
    static syncExpensesWithSchema() {
        const expenseSchema: Schema = {
            expense_id: "",
            amount: "",
            created_at: "",
            date: "",
            location: "",
            note: "",
            payment_mode: "",
            subcategory: "",
            time: "",
            user_id: "",
        };

        return StorageService.syncWithSchema('expenses', expenseSchema);
    }

    // Sync custom categories with schema
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
        };

        return StorageService.syncUser('user', userSchema);
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

        return StorageService.syncWithSchema('budget', budgetSchema);
    }

    // Helper function for syncing with schema
    static syncWithSchema(storageKey: string, defaultSchema: Schema) {
        if (!StorageService.isBrowser()) {
            console.error('localStorage is not available in this environment.');
            return;
        }

        const savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');

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
    
        localStorage.setItem('user', JSON.stringify(syncedSettings));
    }
    
}
