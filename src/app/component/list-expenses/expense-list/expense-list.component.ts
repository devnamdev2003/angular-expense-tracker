import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})

export class ExpenseListComponent {
  @Input() expenses: any[] = [];
  @Input() currency: string | null;
  @Output() expenseSelected = new EventEmitter<any>();

  constructor(
  ) {
    this.currency = '';

  }

  onSelect(expense: any) {
    this.expenseSelected.emit(expense);
  }

  getFormattedDate(exp: any): string {
    const date = new Date(exp.date);
    return date.toLocaleDateString();
  }

  darkenColor(color: string, percent: number): string {
    try {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent * 100);
      const R = (num >> 16) - amt;
      const G = ((num >> 8) & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;

      return `rgb(${Math.max(R, 0)}, ${Math.max(G, 0)}, ${Math.max(B, 0)})`;
    } catch {
      return color;
    }
  }
}