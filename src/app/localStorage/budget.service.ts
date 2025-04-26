import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getAll(): any[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('budget') || '[]');
  }

  add(data: any): void {
    if (!this.isBrowser()) return;
    const all = this.getAll();
    const budget_id = crypto.randomUUID();
    all.push({ ...data, budget_id, user_id: '0' });
    localStorage.setItem('budget', JSON.stringify(all));
  }

  update(budget_id: string, newData: any): void {
    if (!this.isBrowser()) return;
    let all = this.getAll();
    all = all.map(item =>
      item.budget_id === budget_id ? { ...item, ...newData } : item
    );
    localStorage.setItem('budget', JSON.stringify(all));
  }
}
