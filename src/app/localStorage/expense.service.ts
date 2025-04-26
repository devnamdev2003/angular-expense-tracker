import { Injectable } from '@angular/core';
import { UserService } from './user.service';

export interface Expense {
  expense_id: string;
  amount: number;
  category_id: string;
  subcategory?: string;
  date: string;
  time: string;
  note?: string;
  payment_mode: string;
  location?: string;
  user_id: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly storageKey = 'expenses';

  constructor(private userService: UserService) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getAll(): Expense[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  add(data: Omit<Expense, 'expense_id' | 'user_id' | 'created_at'>): void {
    if (!this.isBrowser()) return;
    const all = this.getAll();
    const expense_id = crypto.randomUUID();
    const user_id = this.userService.getValue<string>('id') || '0';
    const created_at = new Date().toISOString();

    all.push({ ...data, expense_id, user_id, created_at });
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  update(expense_id: string, newData: Partial<Expense>): void {
    if (!this.isBrowser()) return;
    let all = this.getAll();
    all = all.map(item => item.expense_id === expense_id ? { ...item, ...newData } : item);
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  getByExpenseId(expense_id: string): Expense | null {
    if (!this.isBrowser()) return null;
    return this.getAll().find(item => item.expense_id === expense_id) || null;
  }

  delete(expense_id: string): void {
    if (!this.isBrowser()) return;
    let all = this.getAll();
    all = all.filter(item => item.expense_id !== expense_id);
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  searchByDateRange(fromDate: string, toDate: string): Expense[] {
    if (!this.isBrowser()) return [];
    const all = this.getAll();
    const from = new Date(fromDate);
    const to = new Date(toDate);

    return all.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= from && itemDate <= to;
    });
  }
}
