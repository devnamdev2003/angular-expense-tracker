import { Injectable } from '@angular/core';
import { Expense } from './expense.service';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

/**
 * Interface representing a category used to group expenses.
 */
export interface Category {
  /** Unique identifier for the category. */
  category_id: string;

  /** The display name of the category. */
  name: string;

  /** Icon representing the category (e.g., from an icon set). */
  icon: string;

  /** Color associated with the category (e.g., hex or CSS color). */
  color: string;

  /** The user ID that owns this category. */
  user_id: string;

  /** Indicates whether the category is active. */
  is_active: string;

  /** 
   * Number of expenses linked to this category.  
   * (This is a computed field and not part of the stored table.)
   */
  expense_count: number;
}

/**
 * Service responsible for managing categories in local storage.
 * Provides methods to create, read, update, delete, and sort categories,
 * ensuring data consistency with associated expenses.
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {

  /**
   * Creates an instance of CategoryService.
   *
   * @param storageService Service to handle local storage operations.
   * @param userService Service to retrieve user-related values (like user ID).
   */
  constructor(
    private storageService: StorageService,
    private userService: UserService
  ) { }

  /**
   * Checks if the code is running in a browser environment
   * with `localStorage` available.
   *
   * @returns {boolean} True if running in the browser, false otherwise.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Retrieves all categories sorted by the number of expenses assigned to each.
   * If two categories have the same count, they are sorted alphabetically by name.
   *
   * @returns {Category[]} Sorted list of categories with expense counts.
   */
  getSortedCategoriesByExpenseCount(): Category[] {
    const expenses: Expense[] = this.storageService.getAllExpenses();
    const categories: Category[] = this.storageService.getAllCategories();

    const expenseCountMap = expenses.reduce((map, expense) => {
      map[expense.category_id] = (map[expense.category_id] || 0) + 1;
      return map;
    }, {} as { [key: string]: number });

    return categories
      .map((category) => ({
        ...category,
        expense_count: expenseCountMap[category.category_id] || 0
      }))
      .sort((a, b) => b.expense_count - a.expense_count || a.name.localeCompare(b.name));
  }

  /**
   * Retrieves all categories from local storage.
   *
   * @returns {Category[]} List of all categories, or an empty array if not in the browser.
   */
  getAll(): Category[] {
    if (!this.isBrowser()) return [];
    return this.storageService.getAllCategories();
  }

  /**
   * Adds a new category to local storage.
   * Generates a unique `category_id` and associates it with the current user.
   *
   * @param data Category data excluding `category_id` and `user_id`.
   */
  add(data: Omit<Category, 'category_id' | 'user_id'>): void {
    if (!this.isBrowser()) return;
    const all: Category[] = this.getAll();
    const category_id = crypto.randomUUID();
    const user_id = this.userService.getValue<string>('id') || '0';

    all.push({ ...data, category_id, user_id });
    localStorage.setItem(this.storageService.getCategoryKey(), JSON.stringify(all));
  }

  /**
   * Updates an existing category in local storage.
   *
   * @param category_id The ID of the category to update.
   * @param newData Partial category fields to update.
   */
  update(category_id: string, newData: Partial<Category>): void {
    if (!this.isBrowser()) return;
    let all: Category[] = this.getAll();
    all = all.map(item => item.category_id === category_id ? { ...item, ...newData } : item);
    localStorage.setItem(this.storageService.getCategoryKey(), JSON.stringify(all));
  }

  /**
   * Deletes a category from local storage by its ID.
   * If the category does not exist, a warning is logged.
   *
   * @param category_id The ID of the category to delete.
   */
  delete(category_id: string): void {
    if (!this.isBrowser()) return;
    const all: Category[] = this.getAll();

    // Check if the category actually exists before attempting deletion
    const categoryExists = all.some(c => c.category_id === category_id);
    if (!categoryExists) {
      console.warn(`Category with ID ${category_id} not found.`);
      return;
    }

    const updated = all.filter(c => c.category_id !== category_id);
    localStorage.setItem(this.storageService.getCategoryKey(), JSON.stringify(updated));
  }

  /**
   * Replaces all categories in local storage with the provided list.
   *
   * @param categories The new list of categories to store.
   */
  updateAllCategories(categories: Category[]): void {
    if (!this.isBrowser()) return;
    this.storageService.updateCategories(categories);
  }
}
