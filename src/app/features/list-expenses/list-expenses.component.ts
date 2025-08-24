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

@Component({
  standalone: true,
  selector: 'app-list-expenses',
  imports: [CommonModule, FormsModule, ExpenseDetailsModalComponent, ExpenseListComponent, SearchButtonComponent],
  templateUrl: './list-expenses.component.html',
  styleUrls: ['./list-expenses.component.css'],
})

export class ListExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  categories: Category[] = [];
  currency: string | null;
  isSortByDropdownOpen: boolean = false;
  selectedFieldName: string = 'Sort By';
  isFilterDropdownOpen: boolean = false;
  selectedExpense: Expense | null = null;
  fieldDirection: number = 0;
  fieldColIndex: number = 0;
  isEditOpen: boolean = false;
  filter = {
    fromDate: '',
    toDate: '',
    selectedCategoryIds: [] as string[],
    paymentMode: [] as string[],
    isExtraSpending: true
  };

  appliedFilter = {
    fromDate: '',
    toDate: '',
    selectedCategoryIds: [] as string[],
    paymentMode: [] as string[],
    isExtraSpending: true
  };
  isFiltered: boolean = false;
  isSorted: boolean = false;
  totalAmount: number = 0;
  @ViewChild('sortRef') sortRef!: ElementRef;
  @ViewChild('filterRef') filterRef!: ElementRef;

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private userService: UserService
  ) {
    this.currency = this.userService.getValue<string>('currency');
  }

  ngOnInit(): void {
    this.listExpenses();
  }

  listExpenses() {
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
    finally {
      if (this.isSorted) {
        this.sortList(this.fieldColIndex, this.selectedFieldName, this.fieldDirection);
      }
      if (this.isFiltered) {
        this.applyFilter();
      }
    }
  }

  sortList(colIndex: number, fieldName: string, direction: number) {
    this.expenses.sort((a, b) => {
      let valA, valB;

      switch (colIndex) {
        case 0:
          valA = a.amount;
          valB = b.amount;
          break;
        case 1:
          valA = a.category_name;
          valB = b.category_name;
          break;
        case 2:
          valA = new Date(a.date + 'T' + a.time);
          valB = new Date(b.date + 'T' + b.time);
          break;
        default:
          valA = '';
          valB = '';
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

  toggleSortByDropdown() {
    this.isSortByDropdownOpen = !this.isSortByDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.isSortByDropdownOpen &&
      this.sortRef &&
      !this.sortRef.nativeElement.contains(target)
    ) {
      this.toggleSortByDropdown();
    }

    if (
      this.isFilterDropdownOpen &&
      this.filterRef &&
      !this.filterRef.nativeElement.contains(target)
    ) {
      this.toggleFilterDropdown();
    }
  }

  toggleFilterDropdown() {
    if (this.isFiltered) {
      this.filter = structuredClone(this.appliedFilter);
    }
    else {
      this.clearFilter();
    }
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  applyFilter() {
    this.totalAmount = 0;
    let filtered = this.expenses;
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
    this.isFiltered = true;
  }

  onCategoryCheckboxChange(event: Event, categoryId: string) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filter.selectedCategoryIds.push(categoryId);
    } else {
      this.filter.selectedCategoryIds = this.filter.selectedCategoryIds.filter(id => id !== categoryId);
    }
  }

  openExpenseModal(expense: Expense) {
    this.selectedExpense = expense;
  }

  closeModal() {
    this.isEditOpen = false;
    this.selectedExpense = null;
  }

  editExpense(expense: Expense) {
    this.isEditOpen = true;
    this.selectedExpense = expense;
    const { expense_id, ...newData } = expense;
    this.expenseService.update(expense_id, newData);
    this.toastService.show('Expense updated successfully', 'success');
    this.isEditOpen = false;
    this.listExpenses();
  }

  deleteExpense(id: string) {
    if (confirm("Are you sure you want to delete this expense?")) {
      this.expenseService.delete(id);
      this.toastService.show("Expense deleted successfully", 'success');
      this.closeModal();
    }
    this.listExpenses();
  }

  clearFilter() {
    this.filter.fromDate = '';
    this.filter.toDate = '';
    this.filter.selectedCategoryIds = [];
    this.filter.paymentMode = [];
    this.filter.isExtraSpending = false;
    this.isFiltered = false;
    this.listExpenses();
  }

  clearSort() {
    this.isSorted = false;
    this.selectedFieldName = "Sort By";
    this.listExpenses();
  }

  onPaymentModeCheckboxChange(event: Event, categoryId: string) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filter.paymentMode.push(categoryId);
    } else {
      this.filter.paymentMode = this.filter.paymentMode.filter(id => id !== categoryId);
    }
  }

  onSearch(query: string) {
    this.totalAmount = 0;
    console.log('Parent received search query:', query);
    this.expenses = this.expenseService.getAll();
    this.expenses = this.expenses.filter(ex => {
      return ((ex.location && ex.location.toLowerCase().includes(query.toLowerCase())) || (ex.note && ex.note.toLowerCase().includes(query.toLowerCase())));
    });
    this.expenses.forEach((val) => {
      this.totalAmount = this.totalAmount + val.amount;
    })
    this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
    this.clearFiltersAndSorting();
  }

  clearFiltersAndSorting() {
    this.filter.fromDate = '';
    this.filter.toDate = '';
    this.filter.selectedCategoryIds = [];
    this.filter.paymentMode = [];
    this.filter.isExtraSpending = false;
    this.isFiltered = false;
    this.isSorted = false;
    this.selectedFieldName = "Sort By";
  }
}
