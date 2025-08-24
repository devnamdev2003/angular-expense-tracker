import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface User {
  id: string,
  backup_frequency: string,
  email: string,
  is_active: string,
  is_backup: string,
  last_backup: string,
  name: string,
  notifications: string,
  user_password: string,
  theme_mode: string,
  currency: string,
  app_version: string,
  is_app_updated: boolean
};

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private storageService: StorageService) { };

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  get(): Record<string, any> {
    if (!this.isBrowser()) return {};
    return this.storageService.getUser();
  }

  update(key: string, value: any): void {
    if (!this.isBrowser()) return;
    const currentSettings = this.get();
    currentSettings[key] = value;
    localStorage.setItem(this.storageService.getUserKey(), JSON.stringify(currentSettings));
  }

  getValue<T = any>(key: string): T | null {
    const currentSettings = this.get();
    return key in currentSettings ? currentSettings[key] : null;
  }
}
