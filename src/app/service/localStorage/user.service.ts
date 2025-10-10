import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface representing a user profile and application settings.
 */
export interface User {
  /** Unique identifier for the user. */
  id: string;

  /** User's display name. */
  user_name: string;

  /** Timestamp of the last performed backup. */
  last_backup: string;

  /** Preferred theme mode (e.g., light, dark). */
  theme_mode: string;

  /** Preferred currency code (e.g., USD, INR). */
  currency: string;

  /** Application version associated with the user. */
  app_version: string;

  /** Whether the user’s app has been updated to the latest version. */
  is_app_updated: boolean;

  /** Whether to show heatmap on calendar. */
  is_show_heatmap: boolean;

  /** Flag to determine if the user can access music URLs for streaming and downloading. */
  has_music_url_access: boolean;

  /** Flag to determine if the user can access ai ssection for analysis data*/
  has_ai_access: boolean;

  /** Stores the amount associated with the Rose heatmap color */
  rose_amount: number;

  /** Stores the amount associated with the Emerald heatmap color */
  emerald_amount: number;

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
