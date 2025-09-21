import { Injectable } from '@angular/core';
import { Category } from './category.service';
import { StorageService } from './storage.service';

/**
 * Interface representing an expense entry.
 */
export interface Expense {
  /** Unique identifier */
  expense_id: string;

  /** Expense amount */
  amount: number;

  /** Category ID associated with this expense */
  category_id: string;

  /** Date of the expense in YYYY-MM-DD format */
  date: string;

  /** Time of the expense in HH:MM:SS format */
  time: string;

  /** Optional note about the expense */
  note?: string;

  /** Payment mode used for the expense */
  payment_mode: string;

  /** Optional location of the expense */
  location?: string;

  /** Indicates if this is extra spending */
  isExtraSpending?: boolean;

  /** Category name (not part of stored table) */
  category_name: string;

  /** Category icon (not part of stored table) */
  category_icon: string;

  /** Category color (not part of stored table) */
  category_color: string;
}

/**
 * Service for managing expenses stored in localStorage.
 *
 * Features:
 * - Add, update, delete, and retrieve expenses.
 * - Automatically attaches category metadata to each expense.
 * - Supports searching expenses by date range.
 */
@Injectable({ providedIn: 'root' })
export class ExpenseService {

  /**
   * Creates an instance of ExpenseService.
   *
   * @param storageService Service for interacting with localStorage.
   */
  constructor(private storageService: StorageService) { }

  /**
   * Checks if the environment supports localStorage.
   *
   * @returns True if running in a browser with localStorage.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Returns the current date and time in ISO format adjusted for local time.
   *
   * @returns Local ISO string (YYYY-MM-DDTHH:MM:SS)
   */
  getLocalISOString(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  /**
   * Retrieves all expenses from localStorage with category metadata attached.
   *
   * @returns Array of formatted {@link Expense} sorted by date (newest first).
   */
  getAll(): Expense[] {
    if (!this.isBrowser()) return [];
    const expenses: Expense[] = this.storageService.getAllExpenses();
    const categories: Category[] = this.storageService.getAllCategories();
    const formattedExpense = expenses.map(item => ({
      ...item,
      amount: Math.round(item.amount * 100) / 100,
    }));
    return formattedExpense
      .map(e => {
        const cat = categories.find(c => c.category_id === e.category_id);
        return {
          ...e,
          category_name: cat?.name || '',
          category_icon: cat?.icon || '',
          category_color: cat?.color || ''
        };
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
  }

  /**
   * Adds a new expense to localStorage.
   *
   * @param data Expense data excluding `expense_id`.
   */
  add(data: Omit<Expense, 'expense_id'>): void {
    if (!this.isBrowser()) return;
    const all: Expense[] = this.getAll();
    const expense_id = crypto.randomUUID();
    all.push({ ...data, expense_id, amount: Math.round(data.amount * 100) / 100 });
    localStorage.setItem(this.storageService.getExpenseKey(), JSON.stringify(all));
  }

  /**
   * Updates an existing expense by ID.
   *
   * @param expense_id The ID of the expense to update.
   * @param newData Partial data to update the expense with.
   */
  update(expense_id: string, newData: Partial<Expense>): void {
    if (!this.isBrowser()) return;
    let all: Expense[] = this.getAll();
    all = all.map(item => item.expense_id === expense_id ? { ...item, ...newData } : item);
    all = all.map(item => ({ ...item, amount: Math.round(item.amount * 100) / 100 }));
    localStorage.setItem(this.storageService.getExpenseKey(), JSON.stringify(all));
  }

  /**
   * Retrieves a single expense by its ID.
   *
   * @param expense_id The ID of the expense to retrieve.
   * @returns The expense object or null if not found.
   */
  getByExpenseId(expense_id: string): Expense | null {
    if (!this.isBrowser()) return null;
    return this.getAll().find(item => item.expense_id === expense_id) || null;
  }

  /**
   * Deletes an expense by its ID.
   *
   * @param expense_id The ID of the expense to delete.
   */
  delete(expense_id: string): void {
    if (!this.isBrowser()) return;
    let all: Expense[] = this.getAll();
    all = all.filter(item => item.expense_id !== expense_id);
    localStorage.setItem(this.storageService.getExpenseKey(), JSON.stringify(all));
  }

  /**
   * Searches expenses within a date range.
   *
   * @param fromDate Start date in YYYY-MM-DD format.
   * @param toDate End date in YYYY-MM-DD format.
   * @returns Array of expenses within the specified date range.
   */
  searchByDateRange(fromDate: string, toDate: string): Expense[] {
    if (!this.isBrowser()) return [];
    const all: Expense[] = this.getAll();
    const from = new Date(fromDate);
    const to = new Date(toDate);

    return all.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return itemDate >= from && itemDate <= to;
    });
  }
}
