import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { StorageService } from './storage.service';

export interface Budget {
  budget_id: string,
  amount: number,
  fromDate: string,
  toDate: string,
  user_id: string,
  category_id: string
};

@Injectable({ providedIn: 'root' })
export class BudgetService {

  constructor(private userService: UserService,
    private storageService: StorageService
  ) { }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getAll(): Budget[] {
    if (!this.isBrowser()) return [];
    return this.storageService.getAllBudgets();
  }

  add(data: Omit<Budget, 'budget_id' | 'user_id'>): void {
    if (!this.isBrowser()) return;
    const all: Budget[] = this.getAll();
    const budget_id = crypto.randomUUID();
    const user_id = this.userService.getValue<string>('id') || '0';
    all.push({ ...data, budget_id, user_id });
    localStorage.setItem(StorageService.budgetKey, JSON.stringify(all));
  }

  update(budget_id: string, newData: Partial<Budget>): void {
    if (!this.isBrowser()) return;
    let all: Budget[] = this.getAll();
    all = all.map(item =>
      item.budget_id === budget_id ? { ...item, ...newData } : item
    );
    localStorage.setItem(StorageService.budgetKey, JSON.stringify(all));
  }
}
