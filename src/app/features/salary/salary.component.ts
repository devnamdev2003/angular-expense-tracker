import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaryService, Salary } from '../../service/localStorage/salary.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { UserService, User } from '../../service/localStorage/user.service';

/**
 * Component responsible for managing salary transactions and visualizing financial data.
 *
 * This component handles:
 * - Displaying a dashboard of financial metrics (Balance, Income, Expense).
 * - Calculating daily spending limits and suggestions based on the remaining budget.
 * - CRUD operations for Salary transactions.
 * - Visualizing budget usage via a progress bar.
 */
@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {

  /**
   * Reference to the amount input field in the modal for auto-focusing.
   */
  @ViewChild('amountInput') amountInput!: ElementRef;

  /**
   * List of all salary transactions fetched from storage.
   */
  transactions: Salary[] = [];

  /**
   * List of transactions filtered by the currently selected month.
   */
  filteredTransactions: Salary[] = [];

  /**
   * The currently selected month in 'YYYY-MM' format.
   * Defaults to the current month.
   */
  selectedMonth: string = this.getLocalDateString().slice(0, 7);

  /**
   * Controls the visibility of the Add/Edit transaction modal.
   */
  showModal: boolean = false;

  /**
   * Total calculated income for the selected month.
   */
  totalIncome: number = 0;

  /**
   * Total calculated expenses for the selected month.
   */
  totalExpense: number = 0;

  /**
   * Net balance (Income/Budget - Expense) for the selected month.
   */
  totalBalance: number = 0;

  /**
   * Total budget allocated for the selected month.
   */
  totalBudget: number = 0;

  /**
   * Calculated daily allowance based on total budget/income and days in the month.
   */
  dailyAllowed: number = 0;

  /**
   * Average amount spent per day so far in the current month.
   */
  dailySpent: number = 0;

  /**
   * Suggested daily spending limit for the remaining days of the month.
   * Null if the month has passed or no days remain.
   */
  dailySuggested: number | null = null;

  /**
   * Object containing calculated date metrics for the selected month.
   * Includes days passed, days remaining, total days in month, and whether it is a past month.
   */
  dateMetrics: { daysPassed: number; daysRemaining: number; daysInMonth: number; isPastMonth: boolean } = { daysPassed: 0, daysRemaining: 0, daysInMonth: 0, isPastMonth: false };

  /**
   * The percentage of the budget/income that has been spent.
   */
  spentRate: number = 0;

  /**
   * Formatted string representation of the budget usage percentage (capped at 100% for some UI elements).
   */
  budgetPercentage: string = '0';

  /**
   * Width of the visual progress bar (in percent).
   */
  barWidth: number = 0;

  /**
   * CSS class string for the progress bar color based on spending rate (Green, Orange, Red).
   */
  barColorClass: string = '';

  /**
   * Label text for the budget section (e.g., "Salary Usage" vs "Budget Usage").
   */
  budgetLabel: string = '';

  /**
   * Analysis message displayed to the user based on their financial health.
   */
  analysisText: string = '';

  /**
   * CSS class string for styling the analysis text.
   */
  analysisTextClass: string = '';

  /**
   * The maximum selectable month allowed in the date picker, restricted to the current month.
   */
  maxMonth: string = this.getLocalDateString().slice(0, 7);

  /**
   * Signal to hold validation error messages for the transaction form.
   */
  errors = signal<{ amount?: string, note?: string, budget?: string }>({});

  /**
   * The ID of the transaction currently being edited. Null if creating a new transaction.
   */
  editingId: string | null = null;

  /**
   * Model for the transaction amount input.
   */
  newAmount: number | null = null;

  /**
   * Model for the transaction budget input.
   */
  newBudget: number | null = null;

  /**
   * Model for the transaction note input.
   */
  newNote = '';

  /**
   * Model for the transaction month input.
   */
  newMonth: string = this.getLocalDateString().slice(0, 7);

  /**
   * Model for the transaction date input.
   */
  newDate: string = this.getLocalDateString().slice(0, 10);

  /**
   * The user's preferred currency symbol.
   */
  userCurrancy: string | null;

  /**
   * Label for the main balance card (e.g., "Remaining Budget" or "Total Balance").
   */
  balanceLable: string = 'Total Balance';

  /**
   * Constructor for SalaryComponent.
   *
   * @param salaryService Service for managing salary data persistence.
   * @param expenseService Service for retrieving expense data.
   * @param userService Service for retrieving user preferences (e.g., currency).
   */
  constructor(
    private salaryService: SalaryService,
    private expenseService: ExpenseService,
    private userService: UserService
  ) {
    this.userCurrancy = this.userService.getValue<string>('currency') || '';
  }

  /**
   * Angular lifecycle hook called after component initialization.
   * Injects external styles and loads the initial state.
   */
  ngOnInit() {
    this.injectFontAwesome();
    this.loadState();
  }

  /**
   * Dynamically injects FontAwesome and Google Fonts into the document head.
   */
  injectFontAwesome() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);

    const font = document.createElement('link');
    font.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap";
    font.rel = "stylesheet";
    document.head.appendChild(font);
  }

  /**
   * Loads all transaction data and recalculates all financial metrics and UI states.
   * This is the central update function called after any data change.
   */
  loadState() {
    const saved: Salary[] = this.salaryService.getAll();

    if (Array.isArray(saved)) {
      this.transactions = saved.map(t => ({
        ...t,
        amount: Number(t.amount),
        budget: t.budget !== undefined ? Number(t.budget) : undefined
      }));
    } else {
      this.transactions = [];
    }
    this.filteredTransactions = this.filteredTransactionsFunction();
    this.totalIncome = this.totalBalanceFunction();
    this.totalExpense = this.totalExpenseFunction();
    this.totalBudget = this.totalBudgetFunction();
    this.totalBalance = this.totalBudget > 0 ? (this.totalBudget - this.totalExpense) >= 0 ? (this.totalBudget - this.totalExpense) : 0 : (this.totalIncome - this.totalExpense) >= 0 ? (this.totalIncome - this.totalExpense) : 0;
    this.dateMetrics = this.dateMetricsFunction();
    this.dailyAllowed = this.dailyAllowedFunction();
    this.dailySpent = this.dailySpentFunction();
    this.dailySuggested = this.dailySuggestedFunction();
    this.spentRate = this.spentRateFunction();
    this.budgetPercentage = this.budgetPercentageFunction();
    this.barWidth = this.barWidthFunction();
    this.barColorClass = this.barColorClassFunction();
    this.budgetLabel = this.budgetLabelFunction();
    this.analysisText = this.analysisTextFunction();
    this.analysisTextClass = this.analysisTextClassFunction();
    this.balanceLable = this.totalBudget > 0 ? 'Remaining Budget' : 'Remaining Balance';
  }

  /**
   * Updates the selected month and reloads the state.
   *
   * @param value The new month string in 'YYYY-MM' format.
   */
  updateMonth(value: string) {
    if (!value) {
      const current = this.getLocalDateString().slice(0, 7);
      this.selectedMonth = current;
    } else {
      this.selectedMonth = value;
    }
    this.loadState();
  }

  /**
   * Filters the master list of transactions to return only those for the selected month.
   *
   * @returns An array of Salary objects for the current month.
   */
  filteredTransactionsFunction(): Salary[] {
    return this.transactions.filter(t => t.month === this.selectedMonth);
  };

  /**
   * Calculates the total expenses for the selected month by querying the ExpenseService.
   *
   * @returns The total expense amount.
   */
  totalExpenseFunction() {
    const [year, month] = this.selectedMonth.split('-').map(Number);

    const fromDate =
      `${year}-${String(month).padStart(2, '0')}-01`;

    const lastDay = new Date(year, month, 0).getDate();

    const toDate =
      `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const expense: Expense[] =
      this.expenseService.searchByDateRange(fromDate, toDate);

    return expense.reduce((acc, e) => acc + Number(e.amount), 0);
  }

  /**
   * Calculates the total income (sum of salary amounts) for the selected month.
   *
   * @returns The total income amount.
   */
  totalBalanceFunction() {
    return this.filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }

  /**
   * Calculates the total budget set for the selected month.
   *
   * @returns The total budget amount.
   */
  totalBudgetFunction() {
    return this.filteredTransactions.reduce((acc, t) => acc + (t.budget || 0), 0);
  }

  /**
   * Calculates temporal metrics relative to the selected month and current date.
   *
   * @returns An object containing days passed, days remaining, days in month, and past month status.
   */
  dateMetricsFunction() {
    const now = new Date();
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === month;
    const isPastMonth = new Date(year, month - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1);

    let daysPassed = 1;
    let daysRemaining = daysInMonth;

    if (isCurrentMonth) {
      daysPassed = now.getDate();
      daysRemaining = daysInMonth - daysPassed + 1;
    } else if (isPastMonth) {
      daysPassed = daysInMonth;
      daysRemaining = 0;
    } else {
      // Future
      daysPassed = 0;
      daysRemaining = daysInMonth;
    }

    return { daysPassed, daysRemaining, daysInMonth, isPastMonth };
  };

  /**
   * Calculates the average daily spending based on days passed.
   *
   * @returns The average daily expense.
   */
  dailySpentFunction() {
    const expense = this.totalExpense;
    const { daysPassed } = this.dateMetrics;
    if (daysPassed === 0) return 0;
    return expense / daysPassed;
  };

  /**
   * Calculates the allowed daily spending based on the total budget/income.
   *
   * @returns The allowed daily amount.
   */
  dailyAllowedFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    const { daysInMonth } = this.dateMetrics;
    return Math.max(0, amount / daysInMonth);
  };

  /**
   * Calculates a suggested daily spending limit for the remaining days of the month.
   *
   * @returns The suggested daily amount, or 0 if no budget remains or month is passed.
   */
  dailySuggestedFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    const expense = this.totalExpense;
    let { daysRemaining, isPastMonth } = this.dateMetrics;
    daysRemaining = daysRemaining - 1;
    if (isPastMonth || daysRemaining <= 0) return 0;
    const remainingBudget = amount - expense;
    if (remainingBudget <= 0) return 0;
    return remainingBudget / daysRemaining;
  };

  /**
   * Calculates the percentage of the budget that has been spent.
   *
   * @returns The spending rate percentage.
   */
  spentRateFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    const expense = this.totalExpense;
    if (amount === 0) return 0;
    const rate = (expense / amount) * 100;
    return parseFloat(rate.toFixed(1));
  };

  /**
   * Formats the spent rate as a string, capped at 100%.
   *
   * @returns The percentage string.
   */
  budgetPercentageFunction() {
    return Math.min(this.spentRateFunction(), 100).toFixed(1);
  };

  /**
   * Determines the width of the progress bar based on the spent rate.
   *
   * @returns The width percentage (can exceed 100).
   */
  barWidthFunction() {
    return this.spentRateFunction();
  };

  /**
   * Determines the color class of the progress bar based on financial health.
   *
   * @returns A Tailwind CSS gradient class string.
   */
  barColorClassFunction() {
    const rate = this.spentRateFunction();
    if (rate > 90) return 'from-red-500 to-red-600';
    if (rate > 50) return 'from-orange-400 to-orange-500';
    return 'from-green-400 to-indigo-500';
  };

  /**
   * Determines the label for the budget section.
   *
   * @returns "Salary Usage" if no specific budget is set, otherwise "Budget Usage".
   */
  budgetLabelFunction() {
    return this.totalBudget === 0 ? "Salary Usage" : "Budget Usage";
  };

  /**
   * Generates a text analysis of the user's spending habits.
   *
   * @returns A descriptive string advising the user on their financial status.
   */
  analysisTextFunction() {
    const rate = this.spentRateFunction();
    const income = this.totalIncome;
    if (income === 0) return "Add salary to see analysis";
    if (rate > 100) return "⚠️ You have exceeded your salary!";
    if (rate > 80) return "⚠️ Careful! You're running low on funds.";
    if (rate < 50) return "🎉 Excellent! You're saving more than half your salary.";
    return "👍 On track. Keep monitoring your expenses.";
  };

  /**
   * Determines the CSS class for the analysis text based on severity.
   *
   * @returns A Tailwind CSS text color class string.
   */
  analysisTextClassFunction() {
    const rate = this.spentRateFunction();
    const income = this.totalIncome;
    if (income === 0) return "opacity-60";
    if (rate > 100) return "text-red-500 font-bold";
    if (rate > 80) return "text-orange-500 font-medium";
    if (rate < 50) return "text-green-500 font-medium";
    return "text-indigo-400";
  };

  /**
   * Opens the modal to add or edit a transaction.
   * If a transaction is provided, it populates the form for editing.
   *
   * @param transaction Optional transaction object to edit.
   */
  openModal(transaction?: Salary) {
    this.showModal = true;
    this.errors.set({});

    if (transaction) {
      // Edit Mode
      this.editingId = transaction.salary_id;
      this.newAmount = transaction.amount;
      this.newMonth = transaction.month;
      this.newDate = transaction.date;
      this.newBudget = transaction.budget || null;
      this.newNote = transaction.note || '';
    } else {
      // Create Mode
      this.editingId = null;
      this.newAmount = null;
      this.newMonth = this.selectedMonth;
      this.newDate = this.getLocalDateString().slice(0, 10);
      this.newBudget = null;
      this.newNote = '';
    }
    setTimeout(() => {
      this.amountInput?.nativeElement.focus();
    }, 100);
  }

  /**
   * Closes the modal and resets the form state.
   */
  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.newAmount = null;
    this.newBudget = null;
    this.newNote = '';
    this.errors.set({});
  }

  /**
   * Validates and saves the current transaction (create or update).
   * Performs validation on amount, budget, and notes.
   */
  saveTransaction() {
    if (!this.newMonth || !this.newDate) return;
    const errs: { amount?: string, note?: string, budget?: string } = {};
    let isValid = true;

    // Amount Validation
    if (this.newAmount === null) {
      errs.amount = 'Amount is required';
      isValid = false;
    } else if (this.newAmount <= 0) {
      errs.amount = 'Amount must be greater than 0';
      isValid = false;
    } else if (this.newAmount > 100000000) {
      errs.amount = 'Amount limit exceeded (Max 100,000,000)';
      isValid = false;
    }

    // Budget Validation (Only for Income)
    if (this.newBudget !== null && this.newBudget !== undefined) {
      if (this.newBudget <= 0) {
        errs.budget = 'Budget must be greater than 0';
        isValid = false;
      } else if (this.newBudget > 100000000) {
        errs.budget = 'Budget limit exceeded';
        isValid = false;
      } else if (this.newAmount !== null && this.newBudget > this.newAmount) {
        errs.budget = 'Budget cannot exceed Income amount';
        isValid = false;
      }
    }

    // Note Validation
    if (this.newNote && this.newNote.length > 100) {
      errs.note = 'Note cannot exceed 100 characters';
      isValid = false;
    }

    if (!isValid) {
      this.errors.set(errs);
      return;
    }

    if (this.editingId) {
      // Update existing
      this.salaryService.update(this.editingId, {
        amount: Number(this.newAmount),
        month: this.newMonth,
        date: this.newDate,
        budget: this.newBudget ? Number(this.newBudget) : undefined,
        note: this.newNote || undefined
      });
    } else {
      // Create new
      const t: Salary = {
        salary_id: '',
        amount: Number(this.newAmount),
        month: this.newMonth,
        date: this.newDate,
        budget: this.newBudget ? Number(this.newBudget) : undefined,
        note: this.newNote || undefined
      };
      this.salaryService.add(t);
    }
    this.loadState();
    this.closeModal();
  }

  /**
   * Deletes a transaction after user confirmation.
   *
   * @param salary_id The unique ID of the transaction to delete.
   * @param event The mouse event to prevent bubbling.
   */
  removeTransaction(salary_id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this transaction?')) {
      this.salaryService.delete(salary_id);
      this.loadState();
    }
  }

  /**
   * Utility to get the current date as a string in 'YYYY-MM-DD' format.
   *
   * @returns Date string.
   */
  getLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}