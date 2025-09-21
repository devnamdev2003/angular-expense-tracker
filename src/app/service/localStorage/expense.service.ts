import { Injectable } from '@angular/core';
import { Category } from './category.service';
import { StorageService } from './storage.service';

/** Expense data */
export interface Expense {
  /** Unique identifier */
  expense_id: string;

  /** Expense details */
  amount: number;

  /** Category ID */
  category_id: string;

  /** Date in YYYY-MM-DD format */
  date: string;

  /** Time in HH:MM:SS format */
  time: string;

  /** Note */
  note?: string;

  /** Payment mode */
  payment_mode: string;

  /** Location */
  location?: string;

  /** Is extra spending */
  isExtraSpending?: boolean;

  // additional field not a part of table
  /** Category name */
  category_name: string;

  /** Category icon */
  category_icon: string;

  /** Category color */
  category_color: string;

}

@Injectable({ providedIn: 'root' })
export class ExpenseService {

  constructor(private storageService: StorageService) { }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getLocalISOString(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

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

  add(data: Omit<Expense, 'expense_id'>): void {
    if (!this.isBrowser()) return;
    const all: Expense[] = this.getAll();
    const expense_id = crypto.randomUUID();
    all.push({ ...data, expense_id, amount: Math.round(data.amount * 100) / 100 });
    localStorage.setItem(this.storageService.getExpenseKey(), JSON.stringify(all));
  }

  update(expense_id: string, newData: Partial<Expense>): void {
    if (!this.isBrowser()) return;
    let all: Expense[] = this.getAll();
    all = all.map(item => item.expense_id === expense_id ? { ...item, ...newData } : item);
    all = all.map(item => ({ ...item, amount: Math.round(item.amount * 100) / 100 }));
    localStorage.setItem(this.storageService.getExpenseKey(), JSON.stringify(all));
  }

  getByExpenseId(expense_id: string): Expense | null {
    if (!this.isBrowser()) return null;
    return this.getAll().find(item => item.expense_id === expense_id) || null;
  }

  delete(expense_id: string): void {
    if (!this.isBrowser()) return;
    let all: Expense[] = this.getAll();
    all = all.filter(item => item.expense_id !== expense_id);
    localStorage.setItem(this.storageService.getExpenseKey(), JSON.stringify(all));
  }

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
