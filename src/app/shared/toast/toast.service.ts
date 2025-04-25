import { Injectable } from '@angular/core';
import { ToastComponent } from './toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastComponent!: ToastComponent;

  register(toast: ToastComponent) {
    this.toastComponent = toast;
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
    this.toastComponent?.showToast(message, type);
  }
}
