import { Injectable } from '@angular/core';
import { ToastComponent } from '../../shared/toast/toast.component';

/**
 * ToastService
 *
 * A service for displaying toast notifications in the application.
 * It requires registering a `ToastComponent` instance so it can delegate
 * showing messages to the UI component.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  /**
   * Reference to the toast component instance.
   * This is registered once during app initialization.
   */
  private toastComponent!: ToastComponent;

  /**
   * Registers the toast component instance.
   * Must be called once, typically from the root component.
   *
   * @param toast Instance of `ToastComponent` used to render notifications
   */
  register(toast: ToastComponent): void {
    this.toastComponent = toast;
  }

  /**
   * Displays a toast message.
   *
   * @param message The message text to display
   * @param type The type of toast (`success` | `error` | `info` | `warning`)  
   *             Defaults to `'success'`
   * @param duration Duration in milliseconds before auto-hide (default: `3000`)
   */
  show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    duration: number = 3000
  ): void {
    this.toastComponent?.showToast(message, type, duration);
  }
}
