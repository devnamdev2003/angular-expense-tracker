import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { Budget, BudgetService } from '../../service/localStorage/budget.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';
import { UserService } from '../../service/localStorage/user.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
};
@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit {
  budgetForm: FormGroup;
  budgets: Budget[] = [];
  showModal = false;
  showBudgetSection = false;
  latestBudget!: Budget;
  budgetProgress = 0;
  budgetColorClass = 'bg-green-500';
  budgetMessage = '';
  avgAllowedPerDay = 0;
  avgSpentPerDay = 0;
  suggestedPerDay = 0;
  isEditMode = false;
  currency: string | null;
  isDarkMode: boolean = false;
  animatedBudgetProgress = 0;
  displayedPercentage = 0;


  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private userService: UserService,
  ) {
    this.currency = this.userService.getValue<string>('currency');
    this.budgetForm = this.createForm();
    const savedTheme = this.userService.getValue<string>('theme_mode') ?? 'light';
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    }
    else {
      this.isDarkMode = false;
    }
  }

  ngOnInit(): void {
    this.loadBudgets();
  }

  createForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }

  openModal(): void {
    this.budgetForm.reset();
    this.isEditMode = false;
    this.showModal = true;
  }

  openEditModal(): void {
    this.isEditMode = true;
    this.showModal = true;
    this.budgetForm.patchValue({
      amount: this.latestBudget.amount,
      fromDate: this.latestBudget.fromDate,
      toDate: this.latestBudget.toDate,
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit() {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    const data = this.budgetForm.value;

    try {
      if (this.isEditMode) {
        this.budgetService.update(this.latestBudget.budget_id, data);
        this.toastService.show('Budget updated successfully!', 'success');
      } else {
        this.budgetService.add(data);
        this.toastService.show('Budget added successfully!', 'success');
      }

      this.loadBudgets();
      this.closeModal();
    } catch (error) {
      console.error('Submit failed:', error);
      this.toastService.show('Error saving budget.', 'error');
    }
  }

  loadBudgets() {
    this.budgets = this.budgetService.getAll();
    this.showBudgetSection = this.budgets.length > 0;

    if (this.showBudgetSection) {
      this.latestBudget = this.budgets[this.budgets.length - 1];
      this.calculateBudgetProgress();
    }
  }

  calculateBudgetProgress() {
    const totalBudget = parseFloat(this.latestBudget.amount.toString());
    const fromDate = new Date(this.latestBudget.fromDate);
    const toDate = new Date(this.latestBudget.toDate);

    const expenses: Expense[] = this.expenseService.getAll();
    const expensesInRange = expenses.filter((exp: any) => {
      const date = new Date(exp.date);
      return date >= fromDate && date <= toDate;
    });

    const spent = expensesInRange.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
    const percentage = Math.min((spent / totalBudget) * 100, 100);
    const remaining = Math.max(totalBudget - spent, 0);
    this.budgetProgress = percentage;
    this.animatedBudgetProgress = 0;
    this.displayedPercentage = 0;

    setTimeout(() => {
      this.animatedBudgetProgress = this.budgetProgress;
    }, 100);

    this.animatePercentage();

    // Color class logic
    if (percentage > 80) this.budgetColorClass = 'bg-red-500';
    else if (percentage > 50) this.budgetColorClass = 'bg-yellow-500';
    else if (percentage > 30) this.budgetColorClass = 'bg-blue-500';
    else this.budgetColorClass = 'bg-green-500';

    // Budget message
    if (spent > totalBudget) {
      this.budgetMessage = `⚠️ You have exceeded your budget! You spent ${this.currency}${spent.toFixed(2)} which is ${this.currency}${(spent - totalBudget).toFixed(2)} over the limit set between ${this.latestBudget.fromDate} and ${this.latestBudget.toDate}. 😰`;
    } else {
      this.budgetMessage = `✅ You have spent ${this.currency}${spent.toFixed(2)} out of ${this.currency}${totalBudget.toFixed(2)} between ${this.latestBudget.fromDate} and ${this.latestBudget.toDate}. 💸 Remaining: ${this.currency}${remaining.toFixed(2)}`;
    }

    // Average insights
    const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const today = new Date();
    const elapsedDays = Math.max(Math.ceil((today.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const remainingDays = Math.max(totalDays - elapsedDays, 1);

    this.avgAllowedPerDay = totalBudget / totalDays;
    this.avgSpentPerDay = spent / elapsedDays;
    this.suggestedPerDay = remaining / remainingDays;
  }

  animatePercentage() {
    const duration = 800;
    const steps = 40;
    const increment = this.budgetProgress / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.displayedPercentage = +(increment * currentStep).toFixed(1);

      if (currentStep >= steps) {
        this.displayedPercentage = +this.budgetProgress.toFixed(1);
        clearInterval(interval);
      }
    }, duration / steps);
  }

  deleteBudget() {
    if (confirm("Are you sure you want to delete this budget?")) {
      this.budgetService.delete(this.latestBudget.budget_id);
      this.toastService.show("Budget deleted successfully", 'success');
      this.closeModal();
    }
    this.loadBudgets();
  }
}