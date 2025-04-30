import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../service/localStorage/category.service';
import { Budget, BudgetService } from '../../service/localStorage/budget.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule,],
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
      category_id: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }
  openModal(): void {
    this.showModal = true;
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
      this.budgetService.add(data);
      this.toastService.show('Budget added successfully!', 'success');
      this.loadBudgets(); // Refresh list
      this.closeModal();
    } catch (error) {
      console.error('Submit failed:', error);
      this.toastService.show('Error adding expense.', 'error');
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
  
}