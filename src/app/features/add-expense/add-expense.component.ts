import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { CategoryService, Category } from '../../service/localStorage/category.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  categories: Category[] = [];
  selectedCategoryName: string = 'Select Category';
  isCategoryDropdownOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {
    this.expenseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.resetFormWithCurrentDateTime();
  }

  createForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      payment_mode: ['UPI', Validators.required],
      location: ['', Validators.maxLength(50)],
      note: ['', Validators.maxLength(100)]
    });
  }

  loadCategories() {
    this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(category: any) {
    this.expenseForm.patchValue({ category_id: category.category_id });
    this.selectedCategoryName = category.name;
    this.isCategoryDropdownOpen = false;
  }

  resetFormWithCurrentDateTime() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    this.expenseForm.reset({
      amount: '',
      category_id: '',
      date: dateStr,
      time: timeStr,
      payment_mode: 'UPI',
      location: '',
      note: ''
    });

    this.selectedCategoryName = 'Select Category';
  }

  onSubmit() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const data = this.expenseForm.value;
    try {
      this.expenseService.add(data);
      this.toastService.show('Expense added successfully!', 'success');
      this.resetFormWithCurrentDateTime();
      this.loadCategories();
    } catch (error) {
      console.error('Submit failed:', error);
      this.toastService.show('Error adding expense.', 'error');
    }
  }
}
