// storage.service.ts

import { Injectable } from '@angular/core';

interface Schema {
    [key: string]: any;  // Allow indexing with string keys
}

@Injectable({
    providedIn: 'root',
})
export class StorageService {

    static categories = [
        {
            "category_id": 1,
            "name": "Food & Drinks",
            "icon": "🍔",
            "color": "#f94144",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 2,
            "name": "Groceries",
            "icon": "🥦",
            "color": "#f3722c",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 3,
            "name": "Shopping",
            "icon": "🛍️",
            "color": "#f9844a",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 4,
            "name": "Bills & Utilities",
            "icon": "💡",
            "color": "#f9c74f",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 5,
            "name": "Entertainment",
            "icon": "🎬",
            "color": "#90be6d",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 6,
            "name": "Health",
            "icon": "💊",
            "color": "#43aa8b",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 7,
            "name": "Education",
            "icon": "🎓",
            "color": "#577590",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 8,
            "name": "Subscriptions",
            "icon": "📺",
            "color": "#277da1",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 9,
            "name": "Travel",
            "icon": "✈️",
            "color": "#8e44ad",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 10,
            "name": "Rent",
            "icon": "🏠",
            "color": "#34495e",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 11,
            "name": "Family & Friends",
            "icon": "👨‍👩‍👧‍👦",
            "color": "#3498db",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 12,
            "name": "Miscellaneous",
            "icon": "📌",
            "color": "#bdc3c7",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 13,
            "name": "Gifts",
            "icon": "🎁",
            "color": "#c0392b",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 14,
            "name": "Party",
            "icon": "🥳",
            "color": "#e67e22",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 15,
            "name": "Personal Care",
            "icon": "🧴",
            "color": "#9b59b6",
            "is_active": "true",
            "user_id": "0"
        },
        {
            "category_id": 16,
            "name": "Home & Hygiene",
            "icon": "🧼",
            "color": "#2ecc71",
            "is_active": "true",
            "user_id": "0"
        }
    ]

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
            category_id: "",
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

        let savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (storageKey === "categories") {
            savedData = StorageService.categories;
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

        localStorage.setItem('user', JSON.stringify(syncedSettings));
    }

}
