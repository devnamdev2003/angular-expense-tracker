import { Injectable } from '@angular/core';
import { Categories } from './data/categories';
import { ConfigService } from '../config/config.service';

/**
 * Schema interface for local storage items.
 * Defines a generic structure for syncing data with default values.
 */
interface Schema {
  /** Key-value pairs representing item properties */
  [key: string]: any;
}

/**
 * Service for managing LocalStorage data in a structured and schema-compliant way.
 *
 * Features:
 * - Syncs categories, expenses, user, and budget data with predefined schemas.
 * - Provides helper methods to get and update local storage items.
 * - Ensures default values exist for missing properties.
 * - Integrates with {@link ConfigService} to retrieve app version for user data.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {

  /** LocalStorage key for categories */
  private readonly categoryKey = 'categories';

  /** LocalStorage key for expenses */
  private readonly expenseKey = 'expenses';

  /** LocalStorage key for budgets */
  private readonly budgetKey = 'budget';

  /** LocalStorage key for user settings */
  private readonly userKey = 'user';

  /**
   * Creates an instance of StorageService.
   *
   * @param configService Service providing app configuration such as version.
   */
  constructor(private configService: ConfigService) {}

  /**
   * Checks if the current environment has access to localStorage.
   *
   * @returns `true` if localStorage is available, `false` otherwise.
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Syncs categories in localStorage with the default schema and predefined categories.
   */
  syncCategoriesWithSchema(): void {
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

  /**
   * Syncs expenses in localStorage with the default schema.
   */
  syncExpensesWithSchema(): void {
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

  /**
   * Syncs user data in localStorage with the default schema.
   */
  syncUserWithSchema(): void {
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

  /**
   * Syncs budget data in localStorage with the default schema.
   */
  syncBudgetWithSchema(): void {
    const budgetSchema: Schema = {
      budget_id: "",
      amount: 0,
      fromDate: "",
      toDate: ""
    };
    return this.syncWithSchema(this.budgetKey, budgetSchema);
  }

  /**
   * Helper function to sync any localStorage data array with a given schema.
   *
   * @param storageKey The localStorage key to sync.
   * @param defaultSchema The default schema to apply to missing properties.
   */
  private syncWithSchema(storageKey: string, defaultSchema: Schema): void {
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

  /**
   * Syncs user data in localStorage with a schema and updates the app version.
   *
   * @param storageKey The localStorage key for the user.
   * @param defaultSchema The default schema to apply.
   */
  private syncUser(storageKey: string, defaultSchema: Schema): void {
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
    syncedSettings['app_version'] = this.configService.getVersion();

    localStorage.setItem(this.userKey, JSON.stringify(syncedSettings));
  }

  /**
   * Retrieves all categories from localStorage.
   *
   * @returns Array of category objects.
   */
  getAllCategories(): any[] {
    return JSON.parse(localStorage.getItem(this.categoryKey) || '[]');
  }

  /**
   * Retrieves all budgets from localStorage.
   *
   * @returns Array of budget objects.
   */
  getAllBudgets(): any[] {
    return JSON.parse(localStorage.getItem(this.budgetKey) || '[]');
  }

  /**
   * Retrieves user data from localStorage.
   *
   * @returns User object.
   */
  getUser(): any {
    return JSON.parse(localStorage.getItem(this.userKey) || '{}');
  }

  /**
   * Retrieves all expenses from localStorage.
   *
   * @returns Array of expense objects.
   */
  getAllExpenses(): any[] {
    return JSON.parse(localStorage.getItem(this.expenseKey) || '[]');
  }

  /** Returns the localStorage key used for categories */
  getCategoryKey(): string { return this.categoryKey; }

  /** Returns the localStorage key used for expenses */
  getExpenseKey(): string { return this.expenseKey; }

  /** Returns the localStorage key used for budgets */
  getBudgetKey(): string { return this.budgetKey; }

  /** Returns the localStorage key used for user */
  getUserKey(): string { return this.userKey; }

  /**
   * Updates the categories in localStorage.
   *
   * @param categories Array of categories to save.
   */
  updateCategories(categories: any[]): void {
    localStorage.setItem(this.categoryKey, JSON.stringify(categories));
  }

  /**
   * Updates the budgets in localStorage.
   *
   * @param budgets Array of budgets to save.
   */
  updateBudgets(budgets: any[]): void {
    localStorage.setItem(this.budgetKey, JSON.stringify(budgets));
  }

  /**
   * Updates the user data in localStorage.
   *
   * @param user User object to save.
   */
  updateUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}
