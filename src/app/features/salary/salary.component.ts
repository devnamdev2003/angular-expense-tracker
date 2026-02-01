import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaryService, Salary } from '../../service/localStorage/salary.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { UserService } from '../../service/localStorage/user.service';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {

  viewMode: 'salary' | 'budget' = 'salary';
  @ViewChild('amountInput') amountInput!: ElementRef;
  filteredTransactions: Salary[] = [];
  currentMonth: string = this.getLocalDateString().slice(0, 7);
  showModal: boolean = false;
  hasBudgetForCurrentMonth: boolean = false;
  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBudget: number = 0;
  dailyAllowed: number = 0;
  dailySpent: number = 0;
  dailySuggested: number | null = null;
  dateMetrics: any = {};
  spentRate: number = 0;
  budgetPercentage: string = '0';
  barWidth: number = 0;
  barColorClass: string = '';
  analysisText: string = '';
  analysisTextClass: string = '';
  errors = signal<{ amount?: string, note?: string, budget?: string, month?: string }>({});
  editingId: string | null = null;
  newAmount: number | null = null;
  newNote: string = '';
  newMonth: string = this.getLocalDateString().slice(0, 7);
  userCurrancy: string | null;
  savingsPercentage: number = 0;
  salaryGrowth: number = 0;
  daysPassedFromLastExpense: number = 0;

  constructor(
    private salaryService: SalaryService,
    private expenseService: ExpenseService,
    private userService: UserService
  ) {
    this.userCurrancy = this.userService.getValue<string>('currency') || '';
    this.getDaysPassedFromLastExpense();
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

  salaryGrowthFunction(allTransactions: Salary[]) {
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

  savingsRateFunction() {
    if (this.totalIncome === 0) return 0;
    const balance = this.totalIncome - this.totalExpense;
    return (balance / this.totalIncome) * 100;
  }

  totalExpenseFunction() {
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

  dailySpentFunction() {
    if (this.viewMode === 'salary') {
      if (this.dateMetrics.daysPassed === 0) return 0;
      return this.totalExpense / this.dateMetrics.daysPassed;
    }
    else {
      if (this.dateMetrics.daysPassed === 0) return 0;
      return this.totalExpense / this.dateMetrics.daysPassed;
    }
  };

  dailyAllowedFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    return Math.max(0, amount / this.dateMetrics.daysInMonth);
  };

  dailySuggestedFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    let { daysRemaining, isPastMonth } = this.dateMetrics;
    daysRemaining = daysRemaining - 1;
    if (isPastMonth || daysRemaining <= 0) return 0;
    const remaining = amount - this.totalExpense;
    return remaining <= 0 ? 0 : remaining / daysRemaining;
  };

  spentRateFunction() {
    const amount = this.totalBudget === 0 ? this.totalIncome : this.totalBudget;
    if (amount === 0) return 0;
    return parseFloat(((this.totalExpense / amount) * 100).toFixed(1));
  };

  budgetPercentageFunction() { return Math.min(this.spentRateFunction(), 100).toFixed(1); };
  barWidthFunction() { return this.spentRateFunction(); };

  barColorClassFunction() {
    const rate = this.spentRateFunction();
    return rate > 90 ? 'from-red-500 to-red-600' : rate > 50 ? 'from-orange-400 to-orange-500' : 'from-green-400 to-indigo-500';
  };

  analysisTextFunction() {
    const rate = this.spentRateFunction();
    if (this.totalIncome === 0 && this.totalBudget === 0) return "Add salary or budget to start";
    if (rate > 100) return "⚠️ You have exceeded your limit!";
    if (rate > 80) return "⚠️ Careful! You're running low.";
    if (rate < 50) return "🎉 Excellent! Saving > 50%.";
    return "👍 On track.";
  };

  analysisTextClassFunction() {
    const rate = this.spentRateFunction();
    if (this.totalIncome === 0 && this.totalBudget === 0) return "opacity-60";
    return rate > 100 ? "text-red-500 font-bold" : rate > 80 ? "text-orange-500 font-medium" : rate < 50 ? "text-green-500 font-medium" : "text-indigo-400";
  };

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

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.newAmount = null;
    this.newNote = '';
    this.errors.set({});
  }

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

  removeTransaction(salary_id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this entry?')) {
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

  toggleView(mode: 'salary' | 'budget') {
    this.viewMode = mode;
    this.loadState();
  }

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