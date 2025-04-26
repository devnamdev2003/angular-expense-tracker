import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../localStorage/expense.service';
import { CategoryService } from '../../localStorage/category.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})


export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  categories: any[] = [];
  selectedCategoryName: string = 'Select Category';
  isCategoryDropdownOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      subcategory: ['', Validators.maxLength(50)],
      date: ['', Validators.required],
      time: ['', Validators.required],
      payment_mode: ['UPI', Validators.required],
      location: ['', Validators.maxLength(50)],
      note: ['', Validators.maxLength(100)]
    });
  }

  ngOnInit(): void {
    this.loadCategories(); // Just load once and keep hidden
    this.resetFormWithCurrentDateTime();
  }

  loadCategories() {
    this.categories = this.categoryService.getAll();
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

    this.expenseForm.patchValue({
      date: dateStr,
      time: timeStr
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
      this.expenseForm.reset();
      this.resetFormWithCurrentDateTime();
    } catch (error) {
      console.error('Submit failed:', error);
      this.toastService.show('Error adding expense.', 'error');
    }
  }
}

