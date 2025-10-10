import { Injectable } from '@angular/core';

/**
 * Schema interface for local storage items.
 * Defines a generic structure for syncing data with default values.
 */
export interface Schema {
  /** Key-value pairs representing item properties */
  [key: string]: any;
}

/**
 * Service for managing LocalStorage data in a structured and schema-compliant way.
 *
 * Features:
 * - Provides helper methods to get and update local storage items.
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

  /** LocalStorage key for user Liked songs */
  private readonly userLikedSongsKey = 'user_liked_songs';

  /** Schema for categories */
  private readonly categorySchema: Schema = {
    category_id: "",
    name: "",
    icon: "",
    color: "",
    is_active: "",
    user_id: ""
  };

  /** Schema for expenses */
  private readonly expenseSchema: Schema = {
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

  /** Schema for user */
  private readonly userSchema: Schema = {
    id: "",
    user_name: "",
    last_backup: "",
    theme_mode: "dark",
    currency: "₹",
    app_version: "0",
    is_app_updated: true,
    is_show_heatmap: false,
    has_music_url_access: false,
    has_ai_access: false,
    rose_amount: 1000,
    emerald_amount: 300,
  };

  /** Schema for budget */
  private readonly budgetSchema: Schema = {
    budget_id: "",
    amount: 0,
    fromDate: "",
    toDate: ""
  };

  /** Schema for Liked song */
  private readonly likedSongSchema: Schema = {
    song_id: '',
    song_name: '',
    year: '',
    duration: 0,
    language: '',
    copyright: '',
    albumName: '',
    artistName: '',
    image: '',
    downloadUrl: '',
    isLiked: false,
  };

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

  /**
   * Retrieves all liked songs from localStorage.
   *
   * @returns Array of liked songs objects.
   */
  getAllSongs(): any[] {
    return JSON.parse(localStorage.getItem(this.userLikedSongsKey) || '[]');
  }

  /** Returns the localStorage key used for categories */
  getCategoryKey(): string { return this.categoryKey; }

  /** Returns the localStorage key used for expenses */
  getExpenseKey(): string { return this.expenseKey; }

  /** Returns the localStorage key used for budgets */
  getBudgetKey(): string { return this.budgetKey; }

  /** Returns the localStorage key used for user */
  getUserKey(): string { return this.userKey; }

  /** Returns the localStorage key used for user liked songs */
  getUserLikedSongsKey(): string { return this.userLikedSongsKey; }

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

  /** Returns the schema for categories
   * 
   * @returns Schema object for categories
   */
  getcategorySchema(): Schema {
    return this.categorySchema;
  }

  /** Returns the schema for expenses
   * 
   * @returns Schema object for expenses  
   */
  getexpenseSchema(): Schema {
    return this.expenseSchema;
  }

  /** Returns the schema for user 
   * 
   * @returns Schema object for user
  */
  getuserSchema(): Schema {
    return this.userSchema;
  }

  /** Returns the schema for budgets 
   * 
   * @returns Schema object for  budgets
  */
  getbudgetSchema(): Schema {
    return this.budgetSchema;
  }

  /** Returns the schema for liked songs 
   * 
   * @returns Schema object for Liked Song
  */
  getlikedSongSchema(): Schema {
    return this.likedSongSchema;
  }
}
