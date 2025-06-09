import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent implements OnChanges {
  @Input() expenses: any[] = [];
  @Input() currency: string | null = '';
  @Output() expenseSelected = new EventEmitter<any>();

  groupedExpenses: { label: string, expenses: any[] }[] = [];

  ngOnChanges() {
    this.groupExpensesByDate();
  }

  onSelect(expense: any) {
    this.expenseSelected.emit(expense);
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

  groupExpensesByDate() {
    const grouped: { [key: string]: any[] } = {};

    for (const expense of this.expenses) {
      const date = new Date(expense.date);
      const key = date.toDateString(); // group by exact day
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(expense);
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    this.groupedExpenses = Object.entries(grouped)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // most recent first
      .map(([key, value]) => {
        const date = new Date(key);
        let label = this.getDateLabel(date, today, yesterday);
        return { label, expenses: value };
      });
  }

  getDateLabel(date: Date, today: Date, yesterday: Date): string {
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const suffix = this.getDaySuffix(day);

    return `${day}${suffix} ${month} ${year}`;
  }

  getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

}
