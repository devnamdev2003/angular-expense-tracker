import { Component, AfterViewInit } from '@angular/core';
import { ToastService } from '../../service/toast/toast.service';

/**
 * ToastComponent
 *
 * A reusable component responsible for rendering toast notifications.
 * It integrates with `ToastService` to display messages dynamically
 * and handles auto-dismiss after a configurable duration.
 */
@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements AfterViewInit {

  /**
   * Creates an instance of ToastComponent.
   * @param toastService Service used to register this component instance
   * so that it can be accessed globally.
   */
  constructor(private toastService: ToastService) { }

  /**
   * Lifecycle hook that runs after component's view has been fully initialized.
   * Registers this component with the `ToastService` so it can be controlled externally.
   */
  ngAfterViewInit(): void {
    this.toastService.register(this);
  }

  /**
   * Displays a toast notification with a message, style, and duration.
   *
   * @param message The text content of the toast
   * @param type The type of toast (`success` | `error` | `info` | `warning`), defaults to `'success'`
   * @param duration Duration in milliseconds before the toast disappears, defaults to `3000`
   */
  showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    duration: number = 3000
  ): void {
    const toastContainer = document.getElementById('toast-container');

    if (toastContainer) {
      // Clear any existing toasts
      toastContainer.innerHTML = '';

      // Define style classes for each toast type
      const typeClasses: any = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black',
      };

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `
        flex items-center justify-between w-full p-3 rounded shadow-lg text-sm md:text-base
        ${typeClasses[type] || typeClasses.success}
        animate-fade-in
      `;

      // Add message and dismiss button
      toast.innerHTML = `
        <span>${message}</span>
        <button class="ml-4 font-bold focus:outline-none" onclick="this.parentElement.remove()">&times;</button>
      `;

      toastContainer.appendChild(toast);

      // Auto-remove toast after the given duration
      setTimeout(() => {
        toast.remove();
      }, duration);
    }
  }
}
