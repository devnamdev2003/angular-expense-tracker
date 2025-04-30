import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../service/localStorage/category.service';
import { Budget, BudgetService } from '../../service/localStorage/budget.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';

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
  categories: Category[] = [];
  selectedCategoryName: string = 'Select Category';
  isCategoryDropdownOpen: boolean = false;
  budgets: Budget[] = [];
  showModal = false;
  showBudgetSection = false;
  isAll = false;

  latestBudget!: Budget;
  budgetProgress = 0;
  budgetColorClass = 'bg-green-500';
  budgetMessage = '';
  avgAllowedPerDay = 0;
  avgSpentPerDay = 0;
  suggestedPerDay = 0;
  isEditMode = false;
  editingBudgetIndex: number | null = null;

  constructor(
    private categoryService: CategoryService,
    private budgetService: BudgetService,
    private toastService: ToastService,
    private fb: FormBuilder,) {
    this.budgetForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBudgets(); // Load budgets on init
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

      this.loadBudgets(); // Refresh UI
      this.closeModal();
    } catch (error) {
      console.error('Submit failed:', error);
      this.toastService.show('Error saving budget.', 'error');
    }
  }

  loadCategories() {
    this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  loadBudgets() {
    this.budgets = this.budgetService.getAll();
    this.showBudgetSection = this.budgets.length > 0;

    if (this.showBudgetSection) {
      this.latestBudget = this.budgets[this.budgets.length - 1];
      this.calculateBudgetProgress();
    }
  }

  selectCategory(category: any, isAll = false) {
    if (isAll) {
      this.budgetForm.patchValue({ category_id: "0" });
      this.selectedCategoryName = "All Category";
      this.isCategoryDropdownOpen = false;
      this.isAll = true;
    }
    else {
      this.budgetForm.patchValue({ category_id: category.category_id });
      this.selectedCategoryName = category.name;
      this.isCategoryDropdownOpen = false;
      this.isAll = false;
    }
  }

  getCategoryName(category_id: string): string {
    if (category_id === '0') return 'All Category';
    const cat = this.categories.find(c => c.category_id === category_id);
    return cat ? cat.name : 'Unknown';
  }

  calculateBudgetProgress() {
    const totalBudget = parseFloat(this.latestBudget.amount.toString());
    const fromDate = new Date(this.latestBudget.fromDate);
    const toDate = new Date(this.latestBudget.toDate);

    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const expensesInRange = expenses.filter((exp: any) => {
      const date = new Date(exp.date);
      return date >= fromDate && date <= toDate;
    });

    const spent = expensesInRange.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
    const percentage = Math.min((spent / totalBudget) * 100, 100);
    const remaining = Math.max(totalBudget - spent, 0);
    this.budgetProgress = percentage;

    // Color class
    if (percentage > 80) this.budgetColorClass = 'bg-red-500';
    else if (percentage > 50) this.budgetColorClass = 'bg-yellow-500';
    else if (percentage > 30) this.budgetColorClass = 'bg-blue-500';
    else this.budgetColorClass = 'bg-green-500';

    // Budget message
    if (spent > totalBudget) {
      this.budgetMessage = `⚠️ You have exceeded your budget! You spent ₹${spent.toFixed(2)} which is ₹${(spent - totalBudget).toFixed(2)} over the limit set between ${this.latestBudget.fromDate} and ${this.latestBudget.toDate}. 😰`;
    } else {
      this.budgetMessage = `✅ You have spent ₹${spent.toFixed(2)} out of ₹${totalBudget.toFixed(2)} between ${this.latestBudget.fromDate} and ${this.latestBudget.toDate}. 💸 Remaining: ₹${remaining.toFixed(2)}`;
    }

    // Avg insights
    const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const today = new Date();
    const elapsedDays = Math.max(Math.ceil((today.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const remainingDays = Math.max(totalDays - elapsedDays, 1);

    this.avgAllowedPerDay = totalBudget / totalDays;
    this.avgSpentPerDay = spent / elapsedDays;
    this.suggestedPerDay = remaining / remainingDays;
  }
}