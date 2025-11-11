import { Component, OnInit } from '@angular/core';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/localStorage/user.service';
import { HeatmapSummary } from '../../models/heatMap-summary.service';
import { FormModelComponent } from '../../component/form-model/form-model.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigService } from '../../service/config/config.service';
import { ToastService } from '../../service/toast/toast.service';
import { Budget, BudgetService } from '../../service/localStorage/budget.service';

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
  heatmapSummary: HeatmapSummary[] = [
    {
      color: 'bg-[var(--color-rose)]',
      days: 0,
      amount: 0,
      text: ''
    },
    {
      color: 'bg-[var(--color-amber)]',
      days: 0,
      amount: 0,
      text: ''
    },
    {
      color: 'bg-[var(--color-emerald)]',
      days: 0,
      amount: 0,
      text: ''
    },
    {
      color: 'bg-[var(--color-gray)]',
      days: 0,
      amount: 0,
      text: ''
    }
  ];

  /** Controls the visibility of the Edit Heatmap modal */
  showEditHeatMapModel = false;

  /** Form group for handling Heatmap edit form inputs and validations */
  heatMapForm!: FormGroup;

  /** Tracks whether the Rose color modal is currently open */
  isRoseModelOpen: boolean = false;

  /** Tracks whether the Emerald color modal is currently open */
  isEmeraldModelOpen: boolean = false;

  /** Defines the minimum allowed value for the heatmap amount input field in the edit modal, used for form validation. */
  minHeatMapAmount = 0;

  /** Defines the maximum allowed value for the heatmap amount input field in the edit modal, used for form validation. */
  maxHeatMapAmount = 0;

  /** When true, the budget-related radio/checkbox option is displayed. */
  showBudgetRadio: boolean = false;

  /** If true, heatmap threshold values are automatically set based on the user's budget otherwise, the user can set them manually. */
  isBudgetRadioClicked: boolean = false;

  /**
   * Creates an instance of CalendarComponent.
   *
   * @param expenseService Service to retrieve expenses from local storage.
   * @param userService Service to retrieve user settings such as currency.
   * @param fb Angular `FormBuilder` to build the reactive form.
   * @param configService Service to fetch configuration values
   * @param budgetService Service to fetch budget data. 
   * @param toastService Service for displaying toast notifications
   */
  constructor(
    private expenseService: ExpenseService,
    public userService: UserService,
    private fb: FormBuilder,
    private configService: ConfigService,
    private budgetService: BudgetService,
    private toastService: ToastService
  ) {
    this.currency = this.userService.getValue<string>('currency');
    this.isShowHeatmap = this.userService.getValue<boolean>('is_show_heatmap') ?? false;
    this.isBudgetRadioClicked = this.userService.getValue<boolean>('is_budget_radio_clicked') ?? false;
    this.has_music_url_access = this.userService.getValue<boolean>('has_music_url_access') ?? false;
    const [emerald, rose] = this.calculateThresholdValues();
    if (rose > emerald) {
      if (this.isShowHeatmap) {
        this.showBudgetRadio = this.budgetService.getAll().length > 0 ? true : false;
      }
    }
    else {
      this.showBudgetRadio = false;
    }
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
    this.heatmapSummary = this.resetHeatmapSummary();
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
    const [emerald, rose] = this.calculateThresholdValues();
    const rose_amount = (this.isBudgetRadioClicked && this.showBudgetRadio) ? rose : this.userService.getValue<number>('rose_amount') ?? 1000;
    const emerald_amount = (this.isBudgetRadioClicked && this.showBudgetRadio) ? emerald : this.userService.getValue<number>('emerald_amount') ?? 500;
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
    const [emerald, rose] = this.calculateThresholdValues();
    if (rose > emerald) {
      this.showBudgetRadio = this.isShowHeatmap ? true : false;
    }
    else {
      this.showBudgetRadio = false;
    }

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
      existing.text = message;
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
      this.minHeatMapAmount = (this.userService.getValue<number>('emerald_amount') ?? 500) + 1;
      this.maxHeatMapAmount = 100000000 - 1;
      this.isRoseModelOpen = true;
    }
    if (color === 'bg-[var(--color-emerald)]') {
      this.heatMapForm.reset({
        amount: this.userService.getValue<number>('emerald_amount') ?? 500,
      });
      this.minHeatMapAmount = 1;
      this.maxHeatMapAmount = (this.userService.getValue<number>('rose_amount') ?? 1000) - 1;
      this.isEmeraldModelOpen = true;
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
    if (this.isEmeraldModelOpen) {
      this.userService.update('emerald_amount', amount);
    }
    if (this.isRoseModelOpen) {
      this.userService.update('rose_amount', amount);
    }
    this.renderCalendar(this.currentYear, this.currentMonth);
    this.closeEditHeatMapModel();
    this.toastService.show('HeatMap amount updated successfully', 'success');
  }

  resetHeatmapSummary(): HeatmapSummary[] {
    const rose_amount = this.userService.getValue<number>('rose_amount') ?? 1000;
    const emerald_amount = this.userService.getValue<number>('emerald_amount') ?? 500;
    this.heatmapSummary = this.heatmapSummary.map(item => {
      if (item.color === 'bg-[var(--color-rose)]') {
        item.days = 0;
        item.amount = 0;
        item.text = `> ${rose_amount}`;
      }
      if (item.color === 'bg-[var(--color-emerald)]') {
        item.days = 0;
        item.amount = 0;
        item.text = `< ${emerald_amount}`;
      }
      if (item.color === 'bg-[var(--color-amber)]') {
        item.days = 0;
        item.amount = 0;
        item.text = `${emerald_amount} - ${rose_amount}`;
      }
      if (item.color === 'bg-[var(--color-gray)]') {
        item.days = 0;
        item.amount = 0;
        item.text = 'No expenses';
      }
      return item;
    })
    return this.heatmapSummary;
  }

  /**
   * Toggles the "Set Budget" mode for heatmap threshold calculation.
   * 
   * When enabled (`isBudgetRadioClicked = true`), the calendar heatmap thresholds 
   * are recalculated automatically based on the user's budget data.
   * Otherwise, the user can manually set the threshold values.
   * 
   * @returns {void}
 */
  setHeatmapThresholdsByBudget(): void {
    this.isBudgetRadioClicked = !this.isBudgetRadioClicked;
    this.userService.update('is_budget_radio_clicked', this.isBudgetRadioClicked);
    this.renderCalendar(this.currentYear, this.currentMonth);
  }

  /**
   * Calculates the heatmap threshold values (`emerald_amount` and `rose_amount`)
   * based on the user's current budget and expense data.
   * 
   * This method:
   * - Retrieves the latest budget period from the BudgetService.
   * - Filters all expenses that fall within that budget date range.
   * - Computes the total spent, remaining amount, and daily averages.
   * - Determines threshold values dynamically for the calendar heatmap.
   * 
   * @returns {[emerald_amount: number, rose_amount: number]} 
   * Returns a tuple where:
   * - `emerald_amount` represents the lower (better) daily spending threshold.
   * - `rose_amount` represents the higher (warning) daily spending threshold.
 */
  calculateThresholdValues(): [emerald_amount: number, rose_amount: number] {
    const budgets: Budget[] = this.budgetService.getAll();
    if (budgets.length > 0) {
      const latestBudget: Budget = budgets[budgets.length - 1];
      const totalBudget = parseFloat(latestBudget.amount.toString());
      const fromDate = new Date(latestBudget.fromDate);
      const toDate = new Date(latestBudget.toDate);

      // Filter expenses within the budget date range
      const expenses: Expense[] = this.expenseService.getAll();
      const expensesInRange = expenses.filter((exp: any) => {
        const date = new Date(exp.date);
        return date >= fromDate && date <= toDate;
      });

      // Calculate spent amount and percentage
      const spent = expensesInRange.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
      const remaining = Math.max(totalBudget - spent, 0);

      // Calculate average daily insights
      const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const today = new Date(this.configService.getLocalTime());
      const elapsedDays = Math.max(Math.ceil((today.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)), 1);
      const remainingDays = Math.max(totalDays - elapsedDays, 1);

      const avgSpentPerDay = Number((spent / elapsedDays).toFixed(0));
      const suggestedPerDay = Number((remaining / remainingDays).toFixed(0));

      return [suggestedPerDay, avgSpentPerDay];
    }
    return [0, 0];
  }

}
