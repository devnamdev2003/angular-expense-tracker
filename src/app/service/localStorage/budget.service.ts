import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface Budget {
  budget_id: string,
  amount: number,
  fromDate: string,
  toDate: string
};

@Injectable({ providedIn: 'root' })
export class BudgetService {

  constructor(
    private storageService: StorageService
  ) { }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getAll(): Budget[] {
    if (!this.isBrowser()) return [];
    return this.storageService.getAllBudgets();
  }

  add(data: Omit<Budget, 'budget_id'>): void {
    if (!this.isBrowser()) return;
    const all: Budget[] = this.getAll();
    const budget_id = crypto.randomUUID();
    all.push({ ...data, budget_id, amount: Math.round(data.amount * 100) / 100 });
    localStorage.setItem(this.storageService.getBudgetKey(), JSON.stringify(all));
  }

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

  delete(budget_id: string): void {
    if (!this.isBrowser()) return;
    let all: Budget[] = this.getAll();
    all = all.filter(item => item.budget_id !== budget_id);
    localStorage.setItem(this.storageService.getBudgetKey(), JSON.stringify(all));
  }
}
