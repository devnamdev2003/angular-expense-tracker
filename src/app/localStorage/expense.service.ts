import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { CategoryService, Category } from './category.service';

export interface Expense {
  expense_id: string;
  amount: number;
  category_id: string;
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

  constructor(private userService: UserService, private categoryService: CategoryService) { }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getAll(): Expense[] {
    if (!this.isBrowser()) return [];
    const expenses: Expense[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const categories: Category[] = this.categoryService.getAll();

    return expenses
      .map(e => {
        const cat = categories.find(c => c.category_id === e.category_id);
        return {
          ...e,
          category_name: cat?.name || '',
          icon: cat?.icon || '',
          color: cat?.color || ''
        };
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
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
