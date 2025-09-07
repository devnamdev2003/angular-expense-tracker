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
 * Displays a list of expenses with support for:
 * - Sorting
 * - Filtering (date range, categories, payment mode, extra spending)
 * - Searching
 * - Editing and deleting expenses
 * - Viewing expense details in a modal
 */

@Component({
  standalone: true,
  selector: 'app-list-expenses',
  imports: [CommonModule, FormsModule, ExpenseDetailsModalComponent, ExpenseListComponent, SearchButtonComponent],
  templateUrl: './list-expenses.component.html',
  styleUrls: ['./list-expenses.component.css'],
})
export class ListExpensesComponent implements OnInit {
  /** All expenses currently loaded (filtered/sorted if applicable). */
  expenses: Expense[] = [];

  /** All categories, sorted by expense count. */
  categories: Category[] = [];

  /** Currently selected expense (for modal view/edit). */
  selectedExpense: Expense | null = null;

  /** User's preferred currency (retrieved from UserService). */
  currency: string | null;

  /** Currently selected sort option label. */
  selectedFieldName: string = 'Sort By';

  /** Search query for filtering expenses. */
  searchQuery: string = '';

  /** Sort direction (1 = asc, -1 = desc). */
  fieldDirection: number = 0;

  /** Index of column used for sorting. */
  fieldColIndex: number = 0;

  /** Total amount of currently visible expenses. */
  totalAmount: number = 0;

  /** Filter state before being applied. */
  filter = {
    fromDate: '',
    toDate: '',
    selectedCategoryIds: [] as string[],
    paymentMode: [] as string[],
    isExtraSpending: false
  };

  /** Currently applied filters (saved state). */
  appliedFilter = {
    fromDate: '',
    toDate: '',
    selectedCategoryIds: [] as string[],
    paymentMode: [] as string[],
    isExtraSpending: false
  };

  /** Whether sorting is active. */
  isSorted: boolean = false;

  /** Whether the expense edit modal is open. */
  isEditOpen: boolean = false;

  /** Controls visibility of sort dropdown. */
  isSortByDropdownOpen: boolean = false;

  /** Controls visibility of filter dropdown. */
  isFilterDropdownOpen: boolean = false;

  /** Reference to sort dropdown element. */
  @ViewChild('sortRef') sortRef!: ElementRef;

  /** Reference to filter dropdown element. */
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

  /**
   * Lifecycle hook: initializes the component by fetching expenses.
   */
  ngOnInit(): void {
    this.listExpenses();
  }

  /**
   * Loads expenses from storage, calculates totals,
   * and reapplies sorting/filtering if enabled.
   */
  listExpenses(): void {
    this.totalAmount = 0;
    try {
      this.expenses = this.expenseService.getAll();
      this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
      this.expenses.forEach((val) => {
        this.totalAmount = this.totalAmount + val.amount;
      })
      this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  }

  /**
   * Sorts the expense list.
   * @param colIndex Index of the column to sort by
   * @param fieldName Label of the field being sorted
   * @param direction 1 for ascending, -1 for descending
   */
  sortList(colIndex: number, fieldName: string, direction: number): void {
    this.expenses.sort((a, b) => {
      let valA, valB;

      switch (colIndex) {
        case 0: valA = a.amount; valB = b.amount; break;
        case 1: valA = a.category_name; valB = b.category_name; break;
        case 2: valA = new Date(a.date + 'T' + a.time); valB = new Date(b.date + 'T' + b.time); break;
        default: valA = ''; valB = '';
      }

      if (valA instanceof Date && valB instanceof Date) {
        return direction * (valA.getTime() - valB.getTime());
      }

      if (!isNaN(valA as any) && !isNaN(valB as any)) {
        return direction * (Number(valA) - Number(valB));
      }

      return direction * (valA.toString().toLowerCase().localeCompare(valB.toString().toLowerCase(), undefined, { numeric: true }));
    });
    this.fieldColIndex = colIndex;
    this.fieldDirection = direction;
    this.selectedFieldName = fieldName;
    this.isSortByDropdownOpen = false;
    this.isSorted = true;
  }

  /** Toggles the sort dropdown. */
  toggleSortByDropdown(): void {
    this.isSortByDropdownOpen = !this.isSortByDropdownOpen;
  }

  /**
   * Applies the current filter to the expense list.
   */
  applyFilter(): void {
    this.totalAmount = 0;
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

    if (this.appliedFilter.isExtraSpending) {
      filtered = filtered.filter(e => e.isExtraSpending);
    }

    this.expenses = filtered;
    this.expenses.forEach((val) => {
      this.totalAmount = this.totalAmount + val.amount;
    })
    this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
    if (this.isSorted) {
      this.sortList(this.fieldColIndex, this.selectedFieldName, this.fieldDirection);
    }
    this.isFilterDropdownOpen = false;
  }

  /** Toggles the filter dropdown and resets filter state accordingly. */
  toggleFilterDropdown(): void {
    this.filter = structuredClone(this.appliedFilter);
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  /**
    * Handles payment mode checkbox changes inside filter modal.
    * @param event Checkbox change event
    * @param categoryId Payment mode value
    */
  onPaymentModeCheckboxChange(event: Event, categoryId: string): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filter.paymentMode.push(categoryId);
    } else {
      this.filter.paymentMode = this.filter.paymentMode.filter(id => id !== categoryId);
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

  /** Clears all filters and reloads expenses. */
  clearFilter(): void {
    this.filter = {
      fromDate: '',
      toDate: '',
      selectedCategoryIds: [],
      paymentMode: [],
      isExtraSpending: false
    };
  }

  /** Clears the applied filter. */
  clearAppliedFilter(): void {
    this.appliedFilter = {
      fromDate: '',
      toDate: '',
      selectedCategoryIds: [],
      paymentMode: [],
      isExtraSpending: false
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
    this.selectedExpense = expense;
    const { expense_id, ...newData } = expense;
    this.expenseService.update(expense_id, newData);
    this.toastService.show('Expense updated successfully', 'success');
    this.isEditOpen = false;
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
    }
  }

  /**
   * Searches expenses by location or note.
   * @param query Search query string
   */
  searchData(query: string): void {
    this.expenses = this.expenseService.getAll();
    this.expenses = this.expenses.filter(ex => {
      return ((ex.location && ex.location.toLowerCase().includes(query.toLowerCase())) ||
        (ex.note && ex.note.toLowerCase().includes(query.toLowerCase())));
    });
  }

  /**
   * Searches expenses by location or note.
   * @param query Search query string
   */
  onSearch(query: string): void {
    this.totalAmount = 0;
    this.searchQuery = query;
    this.searchData(this.searchQuery);
    this.expenses.forEach((val) => {
      this.totalAmount = this.totalAmount + val.amount;
    })
    this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
    this.clearFiltersAndSorting();
  }

  /** Resets both filters and sorting without reloading expenses. */
  clearFiltersAndSorting(): void {
    this.clearFilter();
    this.clearAppliedFilter();
    this.isSorted = false;
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
}