import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { CategoryService, Category } from '../../service/localStorage/category.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';
import { UserService } from '../../service/localStorage/user.service';
import { FormsModule } from '@angular/forms';
import { ExpenseDetailsModalComponent } from "../../component/list-expenses/expense-details-modal/expense-details-modal.component";
import { ExpenseListComponent } from "../../component/list-expenses/expense-list/expense-list.component";
import { SearchButtonComponent } from '../../component/search-button/search-button.component';

/**
 * ListExpensesComponent
 *
 * Provides a full-featured expense list view with support for:
 * - Sorting by amount, category, or date
 * - Filtering by date range, category, payment mode, or extra spending
 * - Free-text searching (location and note fields)
 * - Editing and deleting expenses
 * - Viewing expense details in a modal
 *
 * Integrates with services for persistence, categories, user preferences, and toasts.
 */
@Component({
  standalone: true,
  selector: 'app-list-expenses',
  imports: [CommonModule, FormsModule, ExpenseDetailsModalComponent, ExpenseListComponent, SearchButtonComponent],
  templateUrl: './list-expenses.component.html',
  styleUrls: ['./list-expenses.component.css'],
})
export class ListExpensesComponent implements OnInit {
  /** All expenses currently displayed (after filtering/sorting). */
  expenses: Expense[] = [];

  /** List of categories sorted by expense count. */
  categories: Category[] = [];

  /** Currently selected expense (for modal). */
  selectedExpense: Expense | null = null;

  /** User's preferred currency (from UserService). */
  currency: string | null;

  /** Selected sort field label (shown in UI). */
  selectedFieldName: string = 'Sort By';

  /** Current search query string. */
  searchQuery: string = '';

  /** Sort direction: 1 = ascending, -1 = descending. */
  fieldDirection: number = 0;

  /** Index of column currently sorted. */
  fieldColIndex: number = 0;

  /** Total of visible expenses. */
  totalAmount: number = 0;

  /** Pending filter values (before apply). */
  filter = {
    fromDate: '',
    toDate: '',
    selectedCategoryIds: [] as string[],
    paymentMode: [] as string[],
    extraSpending: [] as string[]
  };

  /** Active filter values (after apply). */
  appliedFilter = {
    fromDate: '',
    toDate: '',
    selectedCategoryIds: [] as string[],
    paymentMode: [] as string[],
    extraSpending: [] as string[]
  };

  /** Whether list is sorted. */
  isSorted: boolean = false;

  /** Whether list is sorted. */
  isFilterdData: boolean = false;

  /** Whether edit modal is open. */
  isEditOpen: boolean = false;

  /** Controls sort dropdown visibility. */
  isSortByDropdownOpen: boolean = false;

  /** Controls filter dropdown visibility. */
  isFilterDropdownOpen: boolean = false;

  /** Ref to sort dropdown element. */
  @ViewChild('sortRef') sortRef!: ElementRef;

  /** Ref to filter dropdown element. */
  @ViewChild('filterRef') filterRef!: ElementRef;

  /**
   * Creates an instance of ListExpensesComponent.
   * @param expenseService Service to manage expenses in local storage
   * @param categoryService Service to manage categories
   * @param toastService Service to display toast messages
   * @param userService Service to manage user preferences (e.g., currency)
   */
  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private userService: UserService
  ) {
    this.currency = this.userService.getValue<string>('currency');
  }

  /** Angular lifecycle hook: initializes expense list. */
  ngOnInit(): void {
    this.listExpenses();
  }

  /**
   * Fetches all expenses, categories, and calculates total.
   * Reapplies filters and sorting if active.
   */
  listExpenses(): void {
    try {
      this.expenses = this.expenseService.getAll();
      this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
      this.setTotalAmount();
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  }

  /**
   * Sorts the expense list.
   * @param colIndex Column index (0 = amount, 1 = category, 2 = date)
   * @param fieldName Label of field
   * @param direction 1 = asc, -1 = desc
   */
  sortList(colIndex: number, fieldName: string, direction: number): void {
    this.expenses.sort((a, b) => {
      let valA: any, valB: any;

      switch (colIndex) {
        case 0: valA = a.amount; valB = b.amount; break;
        case 1: valA = a.category_name; valB = b.category_name; break;
        case 2: valA = new Date(a.date + 'T' + a.time); valB = new Date(b.date + 'T' + b.time); break;
        default: valA = ''; valB = '';
      }

      if (valA instanceof Date && valB instanceof Date) {
        return direction * (valA.getTime() - valB.getTime());
      }

      if (!isNaN(valA) && !isNaN(valB)) {
        return direction * (Number(valA) - Number(valB));
      }

      return direction * valA.toString().toLowerCase()
        .localeCompare(valB.toString().toLowerCase(), undefined, { numeric: true });
    });

    this.fieldColIndex = colIndex;
    this.fieldDirection = direction;
    this.selectedFieldName = fieldName;
    this.isSortByDropdownOpen = false;
    this.isSorted = true;
  }

  /** Toggles sort dropdown visibility. */
  toggleSortByDropdown(): void {
    this.isSortByDropdownOpen = !this.isSortByDropdownOpen;
  }

  /**
   * Applies filters (date, category, payment, extra spending).
   */
  applyFilter(): void {
    this.searchData(this.searchQuery);
    let filtered: Expense[] = this.expenses;
    this.appliedFilter = structuredClone(this.filter);

    if (this.appliedFilter.fromDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(this.appliedFilter.fromDate));
    }

    if (this.appliedFilter.toDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(this.appliedFilter.toDate));
    }

    if (this.appliedFilter.selectedCategoryIds.length) {
      filtered = filtered.filter(e => this.appliedFilter.selectedCategoryIds.includes(e.category_id));
    }

    if (this.appliedFilter.paymentMode.length) {
      filtered = filtered.filter(e => this.appliedFilter.paymentMode.includes(e.payment_mode));
    }

    if (this.appliedFilter.extraSpending.length === 1) {
      filtered = filtered.filter(e => this.appliedFilter.extraSpending[0] === 'Yes' ? e.isExtraSpending : !e.isExtraSpending);
    }

    this.expenses = filtered;
    this.setTotalAmount();
    if (this.isSorted) {
      this.sortList(this.fieldColIndex, this.selectedFieldName, this.fieldDirection);
    }
    if (this.appliedFilter.fromDate
      || this.appliedFilter.toDate
      || this.appliedFilter.selectedCategoryIds.length
      || this.appliedFilter.paymentMode.length
      || this.appliedFilter.extraSpending.length) {

      this.isFilterdData = true;
    }
    else {
      this.isFilterdData = false;
    }
    this.isFilterDropdownOpen = false;
  }

  /** Toggles filter dropdown, resetting pending filter state. */
  toggleFilterDropdown(): void {
    this.filter = structuredClone(this.appliedFilter);
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  /**
    * Handles payment mode checkbox changes inside filter modal.
    * @param event Checkbox change event
    * @param paymentModeId Payment mode value
   */
  onPaymentModeCheckboxChange(event: Event, paymentModeId: string): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filter.paymentMode.push(paymentModeId);
    } else {
      this.filter.paymentMode = this.filter.paymentMode.filter(id => id !== paymentModeId);
    }
  }

  /**
   * Handles category checkbox changes inside filter modal.
   * @param event Checkbox change event
   * @param categoryId ID of the category being toggled
   */
  onCategoryCheckboxChange(event: Event, categoryId: string): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filter.selectedCategoryIds.push(categoryId);
    } else {
      this.filter.selectedCategoryIds = this.filter.selectedCategoryIds.filter(id => id !== categoryId);
    }
  }

  /**
    * Handles extraSpending checkbox changes inside filter modal.
    * @param event Checkbox change event
    * @param extraSpendingId extraSpending value
   */
  onExtraSpendingCheckboxChange(event: Event, extraSpendingId: string): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filter.extraSpending.push(extraSpendingId);
    } else {
      this.filter.extraSpending = this.filter.extraSpending.filter(id => id !== extraSpendingId);
    }
  }

  /** Resets pending filters. */
  clearFilter(): void {
    this.filter = {
      fromDate: '',
      toDate: '',
      selectedCategoryIds: [],
      paymentMode: [],
      extraSpending: []
    };
  }

  /** Resets applied filters. */
  clearAppliedFilter(): void {
    this.appliedFilter = {
      fromDate: '',
      toDate: '',
      selectedCategoryIds: [],
      paymentMode: [],
      extraSpending: []
    };
  }

  /**
   * Opens the expense modal with selected expense.
   * @param expense Expense to display
   */
  openExpenseModal(expense: Expense): void {
    this.selectedExpense = expense;
  }

  /** Closes the expense modal and resets state. */
  closeModal(): void {
    this.isEditOpen = false;
    this.selectedExpense = null;
  }

  /**
   * Updates an expense and refreshes the list.
   * @param expense Expense to update
   */
  editExpense(expense: Expense): void {
    this.isEditOpen = true;
    let { expense_id, ...newData } = expense;
    this.expenseService.update(expense_id, newData);
    expense = this.expenseService.getByExpenseId(expense.expense_id) ?? expense;
    this.toastService.show('Expense updated successfully', 'success');
    this.isEditOpen = false;
    this.selectedExpense = expense;
    this.expenses = this.expenses.map(item => item.expense_id === expense_id ? { ...item, ...expense } : item);
    this.expenses = this.expenses.map(item => ({ ...item, amount: Math.round(item.amount * 100) / 100 }));
    this.searchData(this.searchQuery);
    if (this.isSorted) {
      this.sortList(this.fieldColIndex, this.selectedFieldName, this.fieldDirection);
    }
    if (this.isFilterdData) {
      this.applyFilter();
    }
  }

  /**
   * Deletes an expense after confirmation.
   * @param id Expense ID
   */
  deleteExpense(id: string): void {
    if (confirm("Are you sure you want to delete this expense?")) {
      this.expenseService.delete(id);
      this.toastService.show("Expense deleted successfully", 'success');
      this.closeModal();
      this.expenses = this.expenses.filter(item => item.expense_id !== id);
    }
  }

  /**
   * Searches expenses by location or note.
   * @param query Search query string
   */
  searchData(query: string): void {
    this.expenses = this.expenseService.getAll();
    if (query.length === 0) {
      return;
    }
    this.expenses = this.expenses.filter(ex => {
      return ((ex.location && ex.location.toLowerCase().includes(query.toLowerCase())) ||
        (ex.note && ex.note.toLowerCase().includes(query.toLowerCase())));
    });
    this.setTotalAmount();
  }

  /**
   * Performs search, updates total, clears filters/sorting.
   * @param query Search query string
   */
  onSearch(query: string): void {
    this.searchQuery = query.trim();
    this.searchData(this.searchQuery);

    if (this.isSorted) {
      this.sortList(this.fieldColIndex, this.selectedFieldName, this.fieldDirection);
    }
    if (this.isFilterdData) {
      this.applyFilter();
    }
    else {
      this.clearFiltersAndSorting();
    }
    this.setTotalAmount();
  }

  /** Resets both filters and sorting state. */
  clearFiltersAndSorting(): void {
    this.clearFilter();
    this.clearAppliedFilter();
    this.isSorted = false;
    this.isFilterdData = false;
    this.selectedFieldName = "Sort By";
  }

  /**
   * Handles document click to close dropdowns when clicking outside.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isSortByDropdownOpen && this.sortRef && !this.sortRef.nativeElement.contains(target)) {
      this.toggleSortByDropdown();
    }
    if (this.isFilterDropdownOpen && this.filterRef && !this.filterRef.nativeElement.contains(target)) {
      this.toggleFilterDropdown();
    }
  }

  /** calculate total amount. */
  setTotalAmount(): void {
    this.totalAmount = 0;
    this.expenses.forEach((val) => {
      this.totalAmount = this.totalAmount + val.amount;
    })
    this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
  }
}