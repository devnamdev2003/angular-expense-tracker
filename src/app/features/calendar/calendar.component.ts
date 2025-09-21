import { Component, OnInit } from '@angular/core';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/localStorage/user.service';

/**
 * Component that renders a monthly calendar view with expense tracking.
 *
 * Features:
 * - Displays days of the current month with previous/next month padding.
 * - Highlights today’s date.
 * - Calculates total expenses per month and per day.
 * - Opens modal to view daily expenses.
 */
@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {

  /** Current year of the calendar */
  currentYear = new Date().getFullYear();

  /** Current month of the calendar (0-11) */
  currentMonth = new Date().getMonth();

  /** Calendar header title (e.g., "September 2025") */
  calendarTitle = '';

  /** Total expenses in the current month */
  totalExpenses = 0;

  /** Array of calendar day objects for rendering */
  calendarDays: any[] = [];

  /** Whether the daily expense modal is visible */
  showModal = false;

  /** Title of the modal showing daily expenses */
  modalTitle = '';

  /** List of expenses for the selected day in the modal */
  modalExpenses: any[] = [];

  /** Currency symbol from user settings */
  currency: string | null;

  /** Weekday labels */
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /**
   * Creates an instance of CalendarComponent.
   *
   * @param expenseService Service to retrieve expenses from local storage.
   * @param userService Service to retrieve user settings such as currency.
   */
  constructor(
    private expenseService: ExpenseService,
    public userService: UserService
  ) {
    this.currency = this.userService.getValue<string>('currency');
  }

  /** Angular lifecycle hook that initializes the calendar view */
  ngOnInit(): void {
    this.renderCalendar(this.currentYear, this.currentMonth);
  }

  /**
   * Changes the calendar month by a specified offset.
   *
   * @param offset Number of months to change (positive or negative)
   */
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

  /**
   * Renders the calendar for a given year and month.
   *
   * @param year Year to render
   * @param month Month to render (0-11)
   */
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

    // Render previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({ label: prevMonthDays - i, classes: 'text-[var(--color-gray-500)] bg-[var(--color-surface)] opacity-50', isCurrentMonth: false });
    }

    // Render current month days
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

    // Render next month padding days
    const totalCells = firstDay + daysInMonth;
    const nextDays = 7 - (totalCells % 7);
    if (nextDays < 7) {
      for (let i = 1; i <= nextDays; i++) {
        this.calendarDays.push({ label: i, classes: 'text-[var(--color-gray-500)] bg-[var(--color-surface)] opacity-50', isCurrentMonth: false });
      }
    }
  }

  /**
   * Calculates the total expenses for a given date range.
   *
   * @param fromDate Start date (YYYY-MM-DD)
   * @param toDate End date (YYYY-MM-DD)
   */
  calculateTotalExpenses(fromDate: string, toDate: string): void {
    try {
      const data: Expense[] = this.expenseService.searchByDateRange(fromDate, toDate);
      this.totalExpenses = data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    } catch (e) {
      console.error("Failed to fetch monthly data:", e);
      this.totalExpenses = 0;
    }
  }

  /**
   * Opens the modal to show expenses for a specific day.
   *
   * @param dateStr Date string (YYYY-MM-DD)
   */
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

  /**
   * Closes the daily expenses modal and clears modal data.
   */
  closeModal(): void {
    this.showModal = false;
    this.modalExpenses = [];
  }
}
