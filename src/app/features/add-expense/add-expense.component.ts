import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { CategoryDropdownComponent } from '../../component/category-dropdown/category-dropdown.component';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';

/**
  * @component
  * @description
  * Component for adding new expenses.
  * 
  * It includes a reactive form and suggestions for location and notes.
*/
@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CategoryDropdownComponent],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit {
  /** The reactive form used to input expense data */
  expenseForm: FormGroup;

  /** Currently selected category name for display */
  selectedCategoryName: string = 'Select Category';

  /** Stored location suggestions based on previous expenses */
  locationSuggestions: any[] = [];

  /** Filtered location suggestions based on user input */
  filteredLocationSuggestions: string[] = [];

  /** Controls visibility of location suggestions dropdown */
  showLocationSuggestions = false;

  /** Stored note suggestions based on previous expenses */
  noteSuggestions: any[] = [];

  /** Filtered note suggestions based on user input */
  filteredNoteSuggestions: string[] = [];

  /** Controls visibility of note suggestions dropdown */
  showNoteSuggestions = false;

  /**
   * Constructor to inject dependencies
   * @param fb FormBuilder instance
   * @param expenseService LocalStorage-based expense service
   * @param toastService Toast notification service
   */
  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private toastService: ToastService
  ) {
    this.expenseForm = this.createForm();
  }

  /** Lifecycle hook that initializes the component */
  ngOnInit(): void {
    this.resetFormWithCurrentDateTime();
    this.loadSuggestionsFromLocalStorage();
    this.onInputChanges();
  }

  /**
   * Creates and configures the reactive form
   * @returns Configured FormGroup
   */
  createForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      payment_mode: ['UPI', Validators.required],
      location: ['', Validators.maxLength(50)],
      note: ['', Validators.maxLength(100)],
      isExtraSpending: [false, Validators.required]
    });
  }

  /**
   * Handles category selection from dropdown
   * @param category The selected category
   */
  onCategorySelected(category: any): void {
    this.expenseForm.patchValue({ category_id: category.category_id });
    this.selectedCategoryName = category.name;
  }

  /** Resets the form with the current date and time */
  resetFormWithCurrentDateTime(): void {
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
      note: '',
      isExtraSpending: false
    });

    this.selectedCategoryName = 'Select Category';
  }

  /** Submits the form and adds the expense */
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

  /** Loads past note and location suggestions from localStorage */
  loadSuggestionsFromLocalStorage(): void {
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

  /** Subscribes to input changes and filters suggestions */
  onInputChanges(): void {
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

  /**
   * Selects a location suggestion and fills it in the input
   * @param suggestion The selected location
   */
  selectLocationSuggestion(suggestion: string): void {
    this.expenseForm.patchValue({ location: suggestion });
    this.showLocationSuggestions = false;
  }

  /**
   * Selects a note suggestion and fills it in the input
   * @param suggestion The selected note
   */
  selectNoteSuggestion(suggestion: string): void {
    this.expenseForm.patchValue({ note: suggestion });
    this.showNoteSuggestions = false;
  }
}
