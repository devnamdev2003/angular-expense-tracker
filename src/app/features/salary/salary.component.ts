import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaryService, Salary } from '../../service/localStorage/salary.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { UserService } from '../../service/localStorage/user.service';

/**
 * Component for managing and visualizing user salary, budgets, and financial metrics.
 * Provides views for tracking income and monthly budget planning.
 */
@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {

  /** Current active view mode of the component */
  viewMode: 'salary' | 'budget' = 'salary';

  /** Reference to the amount input field in the modal for auto-focusing */
  @ViewChild('amountInput') amountInput!: ElementRef;

  /** List of transactions filtered by the current view mode and month */
  filteredTransactions: Salary[] = [];

  /** The current month string in YYYY-MM format */
  currentMonth: string = this.getLocalDateString().slice(0, 7);

  /** Flag to control the visibility of the add/edit modal */
  showModal: boolean = false;

  /** Indicates if a budget entry exists for the currently selected month */
  hasBudgetForCurrentMonth: boolean = false;

  /** Total income calculated from filtered transactions */
  totalIncome: number = 0;

  /** Total expenses calculated based on the current view scope */
  totalExpense: number = 0;

  /** Total budget allocated for the period */
  totalBudget: number = 0;

  /** Theoretical daily allowance based on total budget/income */
  dailyAllowed: number = 0;

  /** Actual daily spending average */
  dailySpent: number = 0;

  /** Suggested daily spending to stay within budget for the remainder of the month */
  dailySuggested: number | null = null;

  /** Calculated date-related metrics (days passed, remaining, etc.) */
  dateMetrics: any = {};

  /** Percentage of budget or income spent */
  spentRate: number = 0;

  /** String representation of the budget percentage for UI display */
  budgetPercentage: string = '0';

  /** Calculated width for the progress bar UI */
  barWidth: number = 0;

  /** CSS class names for the progress bar based on spending health */
  barColorClass: string = '';

  /** Human-readable analysis message regarding financial status */
  analysisText: string = '';

  /** CSS class for styling the analysis text */
  analysisTextClass: string = '';

  /** Reactive signal containing validation errors for the transaction form */
  errors = signal<{ amount?: string, note?: string, budget?: string, month?: string }>({});

  /** ID of the transaction currently being edited; null if creating new */
  editingId: string | null = null;

  /** Buffer for the amount value in the entry form */
  newAmount: number | null = null;

  /** Buffer for the note value in the entry form */
  newNote: string = '';

  /** Buffer for the month selection in the entry form */
  newMonth: string = this.getLocalDateString().slice(0, 7);

  /** The user's preferred currency symbol/code */
  userCurrancy: string | null;

  /** Percentage of income saved */
  savingsPercentage: number = 0;

  /** Percentage growth of salary compared to the previous entry */
  salaryGrowth: number = 0;

  /** Count of days elapsed since the very first recorded expense */
  daysPassedFromLastExpense: number = 0;

  /**
   * @param salaryService Service to handle salary/budget data operations
   * @param expenseService Service to handle expense data operations
   * @param userService Service to retrieve user settings like currency
   */
  constructor(
    private salaryService: SalaryService,
    private expenseService: ExpenseService,
    private userService: UserService
  ) {
    this.userCurrancy = this.userService.getValue<string>('currency') || '';
    this.viewMode = this.userService.getValue<'salary' | 'budget'>('salary_view_mode') || 'salary';
    this.getDaysPassedFromLastExpense();
  }

  /**
   * Initializes the component by loading necessary fonts and the initial financial state.
   */
  ngOnInit() {
    this.injectFontAwesome();
    this.loadState();
  }

  /**
   * Injects external FontAwesome and Google Fonts stylesheets into the document head.
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
   * Refreshes the local state by fetching data from services and recalculating all financial metrics.
   */
  loadState() {
    const allTransactions: Salary[] = this.salaryService.getAll();
    allTransactions.sort((a, b) =>
      b.month.localeCompare(a.month) ||
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.hasBudgetForCurrentMonth = allTransactions.some(t => (t.viewMode === 'budget') && (t.month === this.currentMonth));

    if (this.viewMode === 'salary') {
      this.filteredTransactions = allTransactions.filter(t => t.viewMode === 'salary');
    } else {
      this.filteredTransactions = allTransactions.filter(t => (t.viewMode === 'budget') && (t.month === this.currentMonth));
    }

    this.totalExpense = this.totalExpenseFunction();
    this.totalIncome = this.filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    this.totalBudget = this.filteredTransactions.reduce((acc, t) => acc + (t.budget || 0), 0);
    this.salaryGrowth = this.salaryGrowthFunction(allTransactions);

    this.dateMetrics = this.dateMetricsFunction();

    this.dailyAllowed = this.dailyAllowedFunction();
    this.dailySpent = this.dailySpentFunction();
    this.dailySuggested = this.dailySuggestedFunction();
    this.spentRate = this.spentRateFunction();
    this.budgetPercentage = this.budgetPercentageFunction();
    this.barWidth = this.barWidthFunction();
    this.barColorClass = this.barColorClassFunction();
    this.analysisText = this.analysisTextFunction();
    this.analysisTextClass = this.analysisTextClassFunction();
    this.savingsPercentage = this.savingsRateFunction();
  }

  /**
   * Calculates the percentage growth of the salary compared to the previous month.
   * @param allTransactions Array of all salary and budget transactions
   * @returns Percentage growth value
   */
  salaryGrowthFunction(allTransactions: Salary[]): number {
    const grouped: any = {};
    allTransactions.forEach(item => {
      if (item.viewMode === 'salary') {
        if (!grouped[item.month]) {
          grouped[item.month] = 0;
        }
        grouped[item.month] += item.amount;
      }
    });
    const result = Object.keys(grouped).map(month => ({
      month: month,
      totalSalary: grouped[month]
    }));
    result.sort((a, b) => b.month.localeCompare(a.month));
    if (result.length >= 2) {
      if (result[1].totalSalary === 0) return 0;
      return (((result[0].totalSalary - result[1].totalSalary) / result[1].totalSalary) * 100);
    }
    return 0;
  }

  /**
   * Calculates the current savings rate percentage.
   * @returns Savings rate as a percentage of total income
   */
  savingsRateFunction(): number {
    if (this.totalIncome === 0) return 0;
    const balance = this.totalIncome - this.totalExpense;
    return (balance / this.totalIncome) * 100;
  }

  /**
   * Aggregates total expenses based on whether the user is viewing all time or the current month's budget.
   * @returns Total expense amount
   */
  totalExpenseFunction(): number {
    if (this.viewMode === 'salary') {
      const expense: Expense[] = this.expenseService.getAll();
      return expense.reduce((acc, e) => acc + Number(e.amount), 0);
    }
    else {
      const [year, month] = this.currentMonth.split('-').map(Number);
      const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const toDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const expense: Expense[] = this.expenseService.searchByDateRange(fromDate, toDate);
      return expense.reduce((acc, e) => acc + Number(e.amount), 0);
    }
  }

  /**
   * Computes time-based metrics for the current view (days passed, remaining, etc.).
   * @returns Object containing month and day metrics
   */
  dateMetricsFunction() {
    const now = new Date();
    const [year, month] = this.currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === month;
    const isPastMonth = new Date(year, month - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1);
    let daysPassed = 0;
    if (this.viewMode === 'salary') {
      daysPassed = this.daysPassedFromLastExpense;
    }
    else {
      daysPassed = isCurrentMonth ? now.getDate() : isPastMonth ? daysInMonth : 0;
    }
    let daysRemaining = isCurrentMonth ? daysInMonth - daysPassed : isPastMonth ? 0 : daysInMonth;
    daysRemaining = daysRemaining < 0 ? 0 : daysRemaining;
    return { daysPassed, daysRemaining, daysInMonth, isPastMonth };
  };

  /**
   * Calculates the average daily spending.
   * @returns Daily spend amount
   */
  dailySpentFunction(): number {
    if (this.dateMetrics.daysPassed === 0) return 0;
    return this.totalExpense / this.dateMetrics.daysPassed;
  };

  /**
   * Calculates the maximum daily allowance to stay within the budget/income.
   * @returns Daily allowance amount
   */
  dailyAllowedFunction(): number {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    return Math.max(0, amount / this.dateMetrics.daysInMonth);
  };

  /**
   * Calculates a suggested daily spending limit for the remaining days of the month.
   * @returns Suggested daily amount or 0 if budget exceeded
   */
  dailySuggestedFunction(): number {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    let { daysRemaining, isPastMonth } = this.dateMetrics;
    if (isPastMonth || daysRemaining <= 0) return 0;
    const remaining = amount - this.totalExpense;
    return remaining <= 0 ? 0 : remaining / daysRemaining;
  };

  /**
   * Calculates the ratio of expenses to budget/income.
   * @returns Spent rate as a percentage
   */
  spentRateFunction(): number {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    return parseFloat(((this.totalExpense / amount) * 100).toFixed(1));
  };

  /**
   * Formats the spent rate for display.
   * @returns Percentage string
   */
  budgetPercentageFunction(): string { return Math.min(this.spentRateFunction(), 100).toFixed(1); };

  /**
   * Determines the width of the progress bar.
   * @returns Numeric percentage value
   */
  barWidthFunction(): number { return this.spentRateFunction(); };

  /**
   * Selects Tailwind CSS gradient classes based on the current spending rate.
   * @returns CSS class string
   */
  barColorClassFunction(): string {
    const rate = this.spentRateFunction();
    return rate > 90 ? 'from-red-500 to-red-600' : rate > 50 ? 'from-orange-400 to-orange-500' : 'from-green-400 to-indigo-500';
  };

  /**
   * Generates a feedback message for the user based on their spending.
   * @returns Feedback string
   */
  analysisTextFunction(): string {
    const rate = this.spentRateFunction();
    if (this.totalIncome === 0 && this.totalBudget === 0) return "Add salary or budget to start";
    if (rate > 100) return "⚠️ You have exceeded your limit!";
    if (rate > 80) return "⚠️ Careful! You're running low.";
    if (rate < 50) return "🎉 Excellent! Saving > 50%.";
    return "👍 On track.";
  };

  /**
   * Determines the styling for the analysis message.
   * @returns CSS class string
   */
  analysisTextClassFunction(): string {
    const rate = this.spentRateFunction();
    if (this.totalIncome === 0 && this.totalBudget === 0) return "opacity-60";
    return rate > 100 ? "text-red-500 font-bold" : rate > 80 ? "text-orange-500 font-medium" : rate < 50 ? "text-green-500 font-medium" : "text-indigo-400";
  };

  /**
   * Opens the transaction modal for adding or editing an entry.
   * @param transaction Optional transaction object for editing
   */
  openModal(transaction?: Salary) {
    this.showModal = true;
    this.errors.set({});
    if (transaction) {
      this.editingId = transaction.salary_id;
      const isBudgetEntry = (transaction.budget || 0) > 0;
      this.newAmount = isBudgetEntry ? transaction.budget || 0 : transaction.amount;
      this.newMonth = transaction.month;
      this.newNote = transaction.note || '';
    } else {
      this.editingId = null;
      this.newAmount = null;
      this.newNote = '';
      this.newMonth = this.currentMonth;
    }
    setTimeout(() => { this.amountInput?.nativeElement.focus(); }, 100);
  }

  /**
   * Closes the transaction modal and resets the form state.
   */
  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.newAmount = null;
    this.newNote = '';
    this.errors.set({});
  }

  /**
   * Validates and saves the transaction (either update or create) via the SalaryService.
   */
  saveTransaction() {
    const errs: any = {};
    let isValid = true;
    if (this.newAmount === null) {
      errs.amount = 'Amount is required';
      isValid = false;
    } else if (this.newAmount <= 0) {
      errs.amount = 'Must be greater than 0';
      isValid = false;
    } else if (this.newAmount > 100000000) {
      errs.amount = 'Limit exceeded';
      isValid = false;
    }
    if (this.viewMode === 'salary') {
      if (!this.newMonth) {
        errs.month = 'Month is required';
        isValid = false;
      }
      if (this.newNote && this.newNote.length > 50) {
        errs.note = 'Note too long (max 50)';
        isValid = false;
      }
    } else {
      this.newMonth = this.currentMonth;
    }

    if (!isValid) {
      this.errors.set(errs);
      return;
    }
    const amountVal = this.viewMode === 'salary' ? Number(this.newAmount) : 0;
    const budgetVal = this.viewMode === 'budget' ? Number(this.newAmount) : 0;
    const noteVal = this.viewMode === 'salary' ? this.newNote : '';
    const exists = this.salaryService.getAll().filter(t => t.viewMode === 'budget');

    if (this.editingId) {
      this.salaryService.update(this.editingId, {
        amount: amountVal,
        budget: budgetVal,
        month: this.newMonth,
        note: noteVal
      });
    }
    else if (exists.length > 0 && this.viewMode === 'budget') {
      this.salaryService.update(exists[0].salary_id, {
        amount: amountVal,
        budget: budgetVal,
        month: this.newMonth,
        note: noteVal
      });
    } else {
      const t: Salary = {
        salary_id: '',
        viewMode: this.viewMode,
        amount: amountVal,
        budget: budgetVal,
        month: this.newMonth,
        date: new Date().toISOString(),
        note: noteVal
      };
      this.salaryService.add(t);
    }
    this.loadState();
    this.closeModal();
  }

  /**
   * Removes a transaction after user confirmation.
   * @param salary_id The unique identifier of the transaction
   * @param event The DOM event to prevent bubbling
   */
  removeTransaction(salary_id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this entry?')) {
      this.salaryService.delete(salary_id);
      this.loadState();
    }
  }

  /**
   * Helper method to get the current system date in YYYY-MM-DD format.
   * @returns Formatted date string
   */
  getLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Switches the UI between 'salary' and 'budget' views.
   * @param mode The view mode to switch to
   */
  toggleView(mode: 'salary' | 'budget') {
    this.viewMode = mode;
    this.userService.update('salary_view_mode', mode);
    this.loadState();
  }

  /**
   * Calculates the number of days between today and the oldest recorded expense.
   */
  getDaysPassedFromLastExpense() {
    const expenseData: Expense[] = this.expenseService.getAll();
    if (expenseData.length > 0) {
      expenseData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const lastExpenseDate = new Date(expenseData[0].date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffMs = today.getTime() - lastExpenseDate.getTime();
      this.daysPassedFromLastExpense = Math.floor(
        diffMs / (1000 * 60 * 60 * 24)
      );
    }
  }
}