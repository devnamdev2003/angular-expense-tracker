import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface representing a budget entry.
 */
export interface Budget {
  /** Unique identifier for the budget. */
  budget_id: string;

  /** Budget amount (rounded to 2 decimal places). */
  amount: number;

  /** Start date of the budget period (ISO string). */
  fromDate: string;

  /** End date of the budget period (ISO string). */
  toDate: string;
};

/**
 * Service responsible for managing budgets in local storage.
 * Provides methods to add, update, delete, and fetch budgets,
 * while ensuring data is only accessed in the browser environment.
 */
@Injectable({ providedIn: 'root' })
export class BudgetService {

  /**
   * Creates an instance of BudgetService.
   *
   * @param storageService A service for interacting with local storage keys and data.
   */
  constructor(
    private storageService: StorageService
  ) { }

  /**
   * Checks if the code is running in a browser environment with `localStorage` available.
   *
   * @returns {boolean} True if running in the browser, false otherwise.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Retrieves all budgets stored in local storage.
   *
   * @returns {Budget[]} A list of all saved budgets, or an empty array if not in the browser.
   */
  getAll(): Budget[] {
    if (!this.isBrowser()) return [];
    return this.storageService.getAllBudgets();
  }

  /**
   * Adds a new budget entry to local storage.
   * Automatically generates a unique `budget_id` and rounds the amount to 2 decimals.
   *
   * @param data The budget data (without `budget_id`) to add.
   */
  add(data: Omit<Budget, 'budget_id'>): void {
    if (!this.isBrowser()) return;
    const all: Budget[] = this.getAll();
    const budget_id = crypto.randomUUID();
    all.push({ ...data, budget_id, amount: Math.round(data.amount * 100) / 100 });
    localStorage.setItem(this.storageService.getBudgetKey(), JSON.stringify(all));
  }

  /**
   * Updates an existing budget entry in local storage.
   * Matches by `budget_id` and merges with the provided data.
   * The amount is always rounded to 2 decimals.
   *
   * @param budget_id The ID of the budget to update.
   * @param newData Partial budget fields to update.
   */
  update(budget_id: string, newData: Partial<Budget>): void {
    if (!this.isBrowser()) return;
    let all: Budget[] = this.getAll();
    all = all.map(item =>
      item.budget_id === budget_id ? { ...item, ...newData } : item
    );
    all = all.map(item => (
      { ...item, amount: Math.round(item.amount * 100) / 100 }
    )
    );
    localStorage.setItem(this.storageService.getBudgetKey(), JSON.stringify(all));
  }

  /**
   * Deletes a budget entry from local storage.
   *
   * @param budget_id The ID of the budget to delete.
   */
  delete(budget_id: string): void {
    if (!this.isBrowser()) return;
    let all: Budget[] = this.getAll();
    all = all.filter(item => item.budget_id !== budget_id);
    localStorage.setItem(this.storageService.getBudgetKey(), JSON.stringify(all));
  }

  /**
   * Replaces all budgets in local storage with the provided list.
   *
   * @param budgets The new list of budgets to save.
   */
  updateAllBudgets(budgets: Budget[]): void {
    if (!this.isBrowser()) return;
    this.storageService.updateBudgets(budgets);
  }
}
