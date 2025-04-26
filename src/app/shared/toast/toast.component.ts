import { Component } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})

export class ToastComponent implements AfterViewInit {
  constructor(private toastService: ToastService) { }

  ngAfterViewInit(): void {
    this.toastService.register(this);
  }
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
    const toastContainer = document.getElementById('toast-container');

    if (toastContainer) {
      toastContainer.innerHTML = '';

      const typeClasses: any = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500 text-black',
      };

      const toast = document.createElement('div');
      toast.className = `
        flex items-center justify-between max-w-xs w-full p-4 rounded shadow-lg
        text-white dark:text-white
        ${typeClasses[type] || typeClasses.success}
        animate-fade-in
      `;

      toast.innerHTML = `
        <span>${message}</span>
        <button class="ml-4 font-bold focus:outline-none" onclick="this.parentElement.remove()">&times;</button>
      `;

      toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 5000);
    }
  }
}
