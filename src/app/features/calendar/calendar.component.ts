import { Component, OnInit } from '@angular/core';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/localStorage/user.service';
import { HeatmapSummary } from '../../models/heatMap-summary.service';
import { FormModelComponent } from '../../component/form-model/form-model.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigService } from '../../service/config/config.service';

/**
 * Component that renders a monthly calendar view with expense tracking.
 *
 * Features:
 * - Displays days of the current month with previous/next month padding.
 * - Heatmap visualization based on daily expenses.
 * - Calculates total expenses per month and per day.
 * - Opens modal to view daily expenses.
 */
@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormModelComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
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

  /** Whether to show heatmap colors on the calendar */
  isShowHeatmap: boolean = false;

  /** Flag to determine if the user can access music URLs for streaming and downloading. */
  has_music_url_access: boolean = false;

  /** 
   * Stores the generated heatmap summary data for the current month.
   * Each item contains the color category, total days, and total amount
   * used to render the heatmap legend and summary table.
   */
  heatmapSummary: HeatmapSummary[] = [];

  /** Controls the visibility of the Edit Heatmap modal */
  showEditHeatMapModel = false;

  /** Form group for handling Heatmap edit form inputs and validations */
  heatMapForm!: FormGroup;

  /** Tracks whether the Rose color modal is currently open */
  isRoseModelOpen: boolean = false;

  /** Tracks whether the Emerald color modal is currently open */
  isEmeraldModelOpen: boolean = false;

  /** Tracks whether the Amber color modal is currently open */
  isAmberModelOpen: boolean = false;

  /**
   * Creates an instance of CalendarComponent.
   *
   * @param expenseService Service to retrieve expenses from local storage.
   * @param userService Service to retrieve user settings such as currency.
   * @param fb Angular `FormBuilder` to build the reactive form.
   * @param configService Service to fetch configuration values 
   */
  constructor(
    private expenseService: ExpenseService,
    public userService: UserService,
    private fb: FormBuilder,
    private configService: ConfigService
  ) {
    this.currency = this.userService.getValue<string>('currency');
    this.isShowHeatmap = this.userService.getValue<boolean>('is_show_heatmap') ?? false;
    this.has_music_url_access = this.userService.getValue<boolean>('has_music_url_access') ?? false;
  }

  /** Angular lifecycle hook that initializes the calendar view */
  ngOnInit(): void {
    this.renderCalendar(this.currentYear, this.currentMonth);
    this.heatMapForm = this.fb.group({
      amount: [0, [Validators.required]]
    });
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
    this.heatmapSummary = [];
    const today = new Date(this.configService.getLocalTime());
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
      const cellDate = new Date(`${year}-${monthStr}-${String(day).padStart(2, '0')}`);

      let heat = '';
      if (cellDate <= today) {
        heat = this.getHeatClass(this.getTotalAmount(dateStr));
      }
      else {
        heat = 'bg-[var(--color-surface)]';
      }
      this.calendarDays.push({
        label: day,
        date: dateStr,
        isCurrentMonth: true,
        classes: isToday ? 'bg-[var(--color-accent)] text-white font-bold cursor-pointer' : `${heat} cursor-pointer dayCell-list-item hover:bg-[var(--list-hover)]`
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

  /**
   * Gets the heatmap class for a given expense amount and update the heatmapSummary
 .
   * @param amount The total expense amount for the day.
   * @returns The corresponding heatmap class.
   */
  private getHeatClass(amount: number): string {
    if (this.isShowHeatmap === false) return 'bg-[var(--color-surface)]';
    const rose_amount = this.userService.getValue<number>('rose_amount') ?? 1000;
    const emerald_amount = this.userService.getValue<number>('emerald_amount') ?? 300;
    if (amount === 0) {
      this.addOrUpdateHeatMapSummary('bg-[var(--color-gray)]', amount, 'No expenses')
      return 'bg-[var(--color-gray)]';
    }
    if (amount < emerald_amount) {
      this.addOrUpdateHeatMapSummary('bg-[var(--color-emerald)]', amount, `< ${emerald_amount}`)
      return 'bg-[var(--color-emerald)]';
    }
    if (amount < rose_amount) {
      this.addOrUpdateHeatMapSummary('bg-[var(--color-amber)]', amount, `${emerald_amount} - ${rose_amount}`)
      return 'bg-[var(--color-amber)]';
    }
    this.addOrUpdateHeatMapSummary('bg-[var(--color-rose)]', amount, `> ${rose_amount}`)
    return 'bg-[var(--color-rose)]';
  }

  /**
   * Gets the total expenses for a specific date.
   * @param dateStr Date string in YYYY-MM-DD format
   * @returns The total expense amount for the date
   */
  getTotalAmount(dateStr: string): number {
    return this.expenseService.searchByDateRange(dateStr, dateStr).reduce((acc, exp) => acc + exp.amount || 0, 0);
  }

  /**
   * Toggles the heatmap display and re-renders the calendar.
   */
  toggleHeatmap(): void {
    this.isShowHeatmap = !this.isShowHeatmap;
    this.userService.update('is_show_heatmap', this.isShowHeatmap);
    this.renderCalendar(this.currentYear, this.currentMonth);
  }

  /**
   * Adds a new entry to the heatmap summary or updates an existing one.
   *
   * @param color - The color representing the heat intensity for the day.
   * @param amount - The expense amount to be added for that color.
   *
   * If an entry with the given color already exists in `heatmapSummary`, 
   * it increments the `days` count by 1 and adds the `amount` to the existing total.
   * Otherwise, it creates a new entry with `days` initialized to 1 and `amount` as provided.
   */
  addOrUpdateHeatMapSummary(color: string, amount: number, message: string) {
    const existing = this.heatmapSummary.find(item => item.color === color);
    if (existing) {
      existing.days += 1;
      existing.amount += amount;
    } else {
      this.heatmapSummary.push({
        color: color,
        days: 1,
        amount: amount,
        text: message
      });
    }
    this.heatmapSummary.sort((a, b) => b.amount - a.amount);
  }

  /**
    * Closes the Edit Heatmap modal and resets all color-specific modal states.
    */
  closeEditHeatMapModel(): void {
    this.showEditHeatMapModel = false;
    this.isEmeraldModelOpen = false;
    this.isRoseModelOpen = false;
    this.isAmberModelOpen = false;
  }

  /**
   * Opens the Edit Heatmap modal for a specific color.
   * Resets the form with the corresponding saved amount value.
   *
   * @param color - The background color class of the heatmap block ('bg-[var(--color-rose)]', 'bg-[var(--color-emerald)]', 'bg-[var(--color-amber)]')
   */
  openEditHeapMapModel(color: string): void {
    if (color === 'bg-[var(--color-rose)]') {
      this.heatMapForm.reset({
        amount: this.userService.getValue<number>('rose_amount') ?? 1000,
      });
      this.isRoseModelOpen = true;
    }
    if (color === 'bg-[var(--color-emerald)]') {
      this.heatMapForm.reset({
        amount: this.userService.getValue<number>('emerald_amount') ?? 300,
      });
      this.isEmeraldModelOpen = true;
    }
    if (color === 'bg-[var(--color-amber)]') {
      this.heatMapForm.reset({
        amount: this.userService.getValue<number>('emerald_amount') ?? 300,
      });
      this.isAmberModelOpen = true;
    }
    this.showEditHeatMapModel = !this.showEditHeatMapModel;
  }

  /**
   * Validates and updates the Heatmap amount for the currently open color modal.
   * Persists the new amount to the user service and refreshes the calendar view.
   */
  updateHeatMap(): void {
    if (this.heatMapForm.invalid) {
      this.heatMapForm.markAllAsTouched();
      return;
    }
    const { amount } = this.heatMapForm.value;
    if (this.isEmeraldModelOpen || this.isAmberModelOpen) {
      this.userService.update('emerald_amount', amount);
    }
    if (this.isRoseModelOpen) {
      this.userService.update('rose_amount', amount);
    }
    this.renderCalendar(this.currentYear, this.currentMonth);
    this.closeEditHeatMapModel();
  }
}
