import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface representing a user profile and application settings.
 */
export interface User {
  /** Unique identifier for the user. */
  id: string;

  /** Frequency of backups (e.g., daily, weekly). */
  backup_frequency: string;

  /** User's email address. */
  email: string;

  /** Whether the user account is active. */
  is_active: string;

  /** Indicates if backup is enabled for the user. */
  is_backup: string;

  /** Timestamp of the last performed backup. */
  last_backup: string;

  /** User's display name. */
  name: string;

  /** Notification preferences (e.g., enabled/disabled). */
  notifications: string;

  /** User's password (hashed or plain depending on storage implementation). */
  user_password: string;

  /** Preferred theme mode (e.g., light, dark). */
  theme_mode: string;

  /** Preferred currency code (e.g., USD, INR). */
  currency: string;

  /** Application version associated with the user. */
  app_version: string;

  /** Whether the user’s app has been updated to the latest version. */
  is_app_updated: boolean;
}

/**
 * Service for managing user data and preferences in local storage.
 * Provides methods to read, update, and persist user settings.
 */
@Injectable({ providedIn: 'root' })
export class UserService {

  /**
   * Creates an instance of UserService.
   *
   * @param storageService Service for handling local storage operations.
   */
  constructor(private storageService: StorageService) { }

  /**
   * Checks if the service is running in a browser environment
   * with access to `localStorage`.
   *
   * @returns {boolean} True if running in the browser, false otherwise.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Retrieves the current user object from storage.
   *
   * @returns {Record<string, any>} User data object, or empty object if not available.
   */
  get(): Record<string, any> {
    if (!this.isBrowser()) return {};
    return this.storageService.getUser();
  }

  /**
   * Updates a single user property in local storage.
   *
   * @param key The property key to update.
   * @param value The new value to assign.
   */
  update(key: string, value: any): void {
    if (!this.isBrowser()) return;
    const currentSettings = this.get();
    currentSettings[key] = value;
    localStorage.setItem(this.storageService.getUserKey(), JSON.stringify(currentSettings));
  }

  /**
   * Retrieves a specific user property by key.
   *
   * @typeParam T The expected return type of the value.
   * @param key The property key to retrieve.
   * @returns {T | null} The value if it exists, otherwise `null`.
   */
  getValue<T = any>(key: string): T | null {
    const currentSettings = this.get();
    return key in currentSettings ? currentSettings[key] : null;
  }

  /**
   * Retrieves full user data.
   *
   * @returns {User | {}} The user object, or empty object if not available.
   */
  getUserData(): User | {} {
    if (!this.isBrowser()) return {};
    return this.storageService.getUser();
  }

  /**
   * Updates the entire user object in local storage.
   *
   * @param user The new user object to save.
   */
  updateUserData(user: User | {}): void {
    if (!this.isBrowser()) return;
    this.storageService.updateUser(user);
  }
}
