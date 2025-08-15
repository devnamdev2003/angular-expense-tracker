import { Injectable } from '@angular/core';
import { Expense } from './expense.service';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

export interface Category {
  category_id: string;
  name: string;
  icon: string;
  color: string;
  user_id: string;
  is_active: string,

  // additional field not a part of table
  expense_count: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  constructor(private storageService: StorageService, private userService: UserService) { };

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

  getAll(): Category[] {
    if (!this.isBrowser()) return [];
    return this.storageService.getAllCategories();
  }

  add(data: Omit<Category, 'category_id' | 'user_id'>): void {
    if (!this.isBrowser()) return;
    const all: Category[] = this.getAll();
    const category_id = crypto.randomUUID();
    const user_id = this.userService.getValue<string>('id') || '0';

    all.push({ ...data, category_id, user_id });
    localStorage.setItem(this.storageService.getCategoryKey(), JSON.stringify(all));
  }

  update(category_id: string, newData: Partial<Category>): void {
    if (!this.isBrowser()) return;
    let all: Category[] = this.getAll();
    all = all.map(item => item.category_id === category_id ? { ...item, ...newData } : item);
    localStorage.setItem(this.storageService.getCategoryKey(), JSON.stringify(all));
  }

  delete(category_id: string): void {
    if (!this.isBrowser()) return;
    const all: Category[] = this.getAll();
    // Check if the category actually exists
    const categoryExists = all.some(c => c.category_id === category_id);
    if (!categoryExists) {
      console.warn(`Category with ID ${category_id} not found.`);
      return;
    }

    const updated = all.filter(c => c.category_id !== category_id);
    localStorage.setItem(this.storageService.getCategoryKey(), JSON.stringify(updated));
  }
}
