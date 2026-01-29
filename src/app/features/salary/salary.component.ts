import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaryService, Salary } from '../../service/localStorage/salary.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { UserService, User } from '../../service/localStorage/user.service';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {
  @ViewChild('amountInput') amountInput!: ElementRef;

  transactions: Salary[] = [];
  filteredTransactions: Salary[] = [];
  selectedMonth: string = this.getLocalDateString().slice(0, 7);
  showModal: boolean = false;
  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBalance: number = 0;
  totalBudget: number = 0;
  dailyAllowed: number = 0;
  dailySpent: number = 0;
  dailySuggested: number | null = null;
  dateMetrics: { daysPassed: number; daysRemaining: number; daysInMonth: number; isPastMonth: boolean } = { daysPassed: 0, daysRemaining: 0, daysInMonth: 0, isPastMonth: false };
  spentRate: number = 0;
  budgetPercentage: string = '0';
  barWidth: number = 0;
  barColorClass: string = '';
  budgetLabel: string = '';
  analysisText: string = '';
  analysisTextClass: string = '';
  maxMonth: string = this.getLocalDateString().slice(0, 7);
  errors = signal<{ amount?: string, note?: string, budget?: string }>({});
  editingId: string | null = null;
  newAmount: number | null = null;
  newBudget: number | null = null;
  newNote = '';
  newMonth: string = this.getLocalDateString().slice(0, 7);
  newDate: string = this.getLocalDateString().slice(0, 10);
  userCurrancy: string | null;
  balanceLable: string = 'Total Balance';

  constructor(
    private salaryService: SalaryService,
    private expenseService: ExpenseService,
    private userService: UserService
  ) {
    this.userCurrancy = this.userService.getValue<string>('currency') || '';

  }

  ngOnInit() {
    this.injectFontAwesome();
    this.loadState();
  }

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
    this.totalBalance = this.totalBudget >= 0 ? this.totalBudget - this.totalExpense : this.totalIncome - this.totalExpense;
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
    this.balanceLable = this.totalBudget >= 0 ? 'Remaining Budget' : 'Remaining Balance';
  }


  updateMonth(value: string) {
    if (!value) {
      const current = this.getLocalDateString().slice(0, 7);
      this.selectedMonth = current;
    } else {
      this.selectedMonth = value;
    }
    this.loadState();
  }

  filteredTransactionsFunction(): Salary[] {
    return this.transactions.filter(t => t.month === this.selectedMonth);
  };

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

  totalBalanceFunction() {
    return this.filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }

  totalBudgetFunction() {
    return this.filteredTransactions.reduce((acc, t) => acc + (t.budget || 0), 0);
  }

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

  dailySpentFunction() {
    const expense = this.totalExpense;
    const { daysPassed } = this.dateMetrics;
    if (daysPassed === 0) return 0;
    return expense / daysPassed;
  };

  dailyAllowedFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    const { daysInMonth } = this.dateMetrics;
    return Math.max(0, amount / daysInMonth);
  };

  dailySuggestedFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    const expense = this.totalExpense;
    const { daysRemaining, isPastMonth } = this.dateMetrics;
    if (isPastMonth || daysRemaining <= 0) return 0;
    const remainingBudget = amount - expense;
    if (remainingBudget <= 0) return 0;
    return remainingBudget / daysRemaining;
  };

  spentRateFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    const expense = this.totalExpense;
    if (amount === 0) return 0;
    const rate = (expense / amount) * 100;
    return parseFloat(rate.toFixed(1));
  };

  budgetPercentageFunction() {
    return Math.min(this.spentRateFunction(), 100).toFixed(1);
  };

  barWidthFunction() {
    return this.spentRateFunction();
  };

  barColorClassFunction() {
    const rate = this.spentRateFunction();
    if (rate > 90) return 'from-red-500 to-red-600';
    if (rate > 50) return 'from-orange-400 to-orange-500';
    return 'from-green-400 to-indigo-500';
  };

  budgetLabelFunction() {
    return this.totalBudget === 0 ? "Salary Usage" : "Budget Usage";
  };

  analysisTextFunction() {
    const rate = this.spentRateFunction();
    const income = this.totalIncome;
    if (income === 0) return "Add salary to see analysis";
    if (rate > 100) return "⚠️ You have exceeded your salary!";
    if (rate > 80) return "⚠️ Careful! You're running low on funds.";
    if (rate < 50) return "🎉 Excellent! You're saving more than half your salary.";
    return "👍 On track. Keep monitoring your expenses.";
  };

  analysisTextClassFunction() {
    const rate = this.spentRateFunction();
    const income = this.totalIncome;
    if (income === 0) return "opacity-60";
    if (rate > 100) return "text-red-500 font-bold";
    if (rate > 80) return "text-orange-500 font-medium";
    if (rate < 50) return "text-green-500 font-medium";
    return "text-indigo-400";
  };

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

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.newAmount = null;
    this.newBudget = null;
    this.newNote = '';
    this.errors.set({});
  }

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

  removeTransaction(salary_id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this transaction?')) {
      this.salaryService.delete(salary_id);
      this.loadState();
    }
  }

  getLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}