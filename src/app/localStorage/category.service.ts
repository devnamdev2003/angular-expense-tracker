import { Injectable } from '@angular/core';

export interface Category {
  category_id: string;
  name: string;
  icon: string;
  user_id: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly storageKey = 'categories';

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getAll(): Category[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  add(data: Omit<Category, 'category_id' | 'user_id'>): void {
    if (!this.isBrowser()) return;
    const all = this.getAll();
    const category_id = crypto.randomUUID();
    const user_id = '0'; // You can replace this with real user logic later

    all.push({ ...data, category_id, user_id });
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  update(category_id: string, newData: Partial<Category>): void {
    if (!this.isBrowser()) return;
    let all = this.getAll();
    all = all.map(item => item.category_id === category_id ? { ...item, ...newData } : item);
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }
}
