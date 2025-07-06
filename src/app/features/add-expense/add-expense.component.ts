import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { CategoryDropdownComponent } from '../../component/category-dropdown/category-dropdown.component';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CategoryDropdownComponent],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  selectedCategoryName: string = 'Select Category';
  locationSuggestions: any[] = [];
  filteredLocationSuggestions: string[] = [];
  showLocationSuggestions = false;

  noteSuggestions: any[] = [];
  filteredNoteSuggestions: string[] = [];
  showNoteSuggestions = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private toastService: ToastService
  ) {
    this.expenseForm = this.createForm();
  }

  ngOnInit(): void {
    this.resetFormWithCurrentDateTime();
    this.loadSuggestionsFromLocalStorage();
    this.onInputChanges();
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

  onCategorySelected(category: any) {
    this.expenseForm.patchValue({ category_id: category.category_id });
    this.selectedCategoryName = category.name;
  }

  resetFormWithCurrentDateTime() {
    const now = new Date();

    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

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
      this.loadSuggestionsFromLocalStorage();
    } catch (error) {
      console.error('Submit failed:', error);
      this.toastService.show('Error adding expense.', 'error');
    }
  }

  loadSuggestionsFromLocalStorage() {
    const allExpenses = this.expenseService.getAll() || [];

    this.locationSuggestions = [
      ...new Set(
        allExpenses
          .map(item => item.location?.trim())
          .filter(loc => loc)
      )
    ];

    this.noteSuggestions = [
      ...new Set(
        allExpenses
          .map(item => item.note?.trim())
          .filter(note => note)
      )
    ];
  }

  onInputChanges() {
    this.expenseForm.get('location')?.valueChanges.subscribe(val => {
      const input = val?.toLowerCase().trim() || '';

      if (!input) {
        this.showLocationSuggestions = false;
        this.filteredLocationSuggestions = [];
        return;
      }

      this.filteredLocationSuggestions = this.locationSuggestions.filter(loc =>
        loc.toLowerCase().includes(input)
      );
      this.showLocationSuggestions = this.filteredLocationSuggestions.length > 0;
    });

    this.expenseForm.get('note')?.valueChanges.subscribe(val => {
      const input = val?.toLowerCase().trim() || '';

      if (!input) {
        this.showNoteSuggestions = false;
        this.filteredNoteSuggestions = [];
        return;
      }

      this.filteredNoteSuggestions = this.noteSuggestions.filter(note =>
        note.toLowerCase().includes(input)
      );
      this.showNoteSuggestions = this.filteredNoteSuggestions.length > 0;
    });

  }
  selectLocationSuggestion(suggestion: string) {
    this.expenseForm.patchValue({ location: suggestion });
    this.showLocationSuggestions = false;
  }

  selectNoteSuggestion(suggestion: string) {
    this.expenseForm.patchValue({ note: suggestion });
    this.showNoteSuggestions = false;
  }
}
