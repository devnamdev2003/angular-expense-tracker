import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  private storageKey = 'user';

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  get(): Record<string, any> {
    if (!this.isBrowser()) return {};
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }

  update(key: string, value: any): void {
    if (!this.isBrowser()) return;
    const currentSettings = this.get();
    currentSettings[key] = value;
    localStorage.setItem(this.storageKey, JSON.stringify(currentSettings));
  }

  getValue<T = any>(key: string): T | null {
    const currentSettings = this.get();
    return key in currentSettings ? currentSettings[key] : null;
  }
}
