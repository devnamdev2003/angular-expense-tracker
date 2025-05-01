import { Component, OnInit } from '@angular/core';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/localStorage/user.service';


@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})

export class CalendarComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  calendarTitle = '';
  totalExpenses = 0;
  calendarDays: any[] = [];
  showModal = false;
  modalTitle = '';
  modalExpenses: any[] = [];
  currency: string | null;
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private expenseService: ExpenseService,
    public userService: UserService
  ) {
    this.currency = this.userService.getValue<string>('currency');
  }

  ngOnInit(): void {
    this.renderCalendar(this.currentYear, this.currentMonth);
  }

  changeMonth(offset: number): void {
    this.currentMonth += offset;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar(this.currentYear, this.currentMonth);
  }

  renderCalendar(year: number, month: number): void {
    this.calendarDays = [];
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const monthStr = String(month + 1).padStart(2, '0');
    this.calendarTitle = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

    const fromDate = `${year}-${monthStr}-01`;
    const toDate = `${year}-${monthStr}-${daysInMonth}`;
    this.calculateTotalExpenses(fromDate, toDate);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({ label: prevMonthDays - i, classes: 'text-[var(--color-gray-500)] bg-[var(--color-surface)] opacity-50', isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      this.calendarDays.push({
        label: day,
        date: dateStr,
        isCurrentMonth: true,
        classes: isToday ? 'bg-[var(--color-accent)] text-white font-bold cursor-pointer' : 'bg-[var(--color-surface)] cursor-pointer dayCell-list-item hover:bg-[var(--list-hover)]'
      });
    }

    // Next month padding
    const totalCells = firstDay + daysInMonth;
    const nextDays = 7 - (totalCells % 7);
    if (nextDays < 7) {
      for (let i = 1; i <= nextDays; i++) {
        this.calendarDays.push({ label: i, classes: 'text-[var(--color-gray-500)] bg-[var(--color-surface)] opacity-50', isCurrentMonth: false });
      }
    }
  }

  calculateTotalExpenses(fromDate: string, toDate: string): void {
    try {
      const data: Expense[] = this.expenseService.searchByDateRange(fromDate, toDate);
      this.totalExpenses = data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    } catch (e) {
      console.error("Failed to fetch monthly data:", e);
      this.totalExpenses = 0;
    }
  }

  openModal(dateStr: string): void {
    try {
      const expenses: Expense[] = this.expenseService.searchByDateRange(dateStr, dateStr);
      this.modalExpenses = expenses || [];
      const total = this.modalExpenses.reduce((acc, exp) => acc + parseInt(exp.amount || 0), 0);
      this.modalTitle = `Expenses on ${dateStr}: ${total}`;
      this.showModal = true;
    } catch (err) {
      console.error('Error loading expenses for date:', err);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.modalExpenses = [];
  }
}
