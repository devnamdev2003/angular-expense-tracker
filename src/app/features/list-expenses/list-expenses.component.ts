import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { CategoryService, Category } from '../../service/localStorage/category.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';
import { UserService } from '../../service/localStorage/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-list-expenses',
  imports: [CommonModule, FormsModule],
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
  filter = {
    fromDate: '',
    toDate: '',
    selectedCategoryIds: [] as string[],
  };
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
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
    try {
      this.expenses = this.expenseService.getAll();
      this.categories = this.categoryService.getAll();
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  }

  getFormattedDate(expense: any): string {
    const expDate = new Date(expense.date);
    const timeParts = expense.time.split(":");
    return `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')} ${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
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
    this.selectedFieldName = fieldName;
    this.isSortByDropdownOpen = false;
  }

  confirmDelete(id: string) {
    if (confirm("Are you sure you want to delete this expense?")) {
      this.expenseService.delete(id);
      this.toastService.show("Expense deleted successfully", 'success');
      this.listExpenses();
    }
  }

  toggleSortByDropdown() {
    this.isSortByDropdownOpen = !this.isSortByDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.isSortByDropdownOpen &&
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(target)
    ) {
      this.isSortByDropdownOpen = false;
    }

    if (
      this.isFilterDropdownOpen &&
      this.filterRef &&
      !this.filterRef.nativeElement.contains(target)
    ) {
      this.isFilterDropdownOpen = false;
    }
  }

  toggleFilterDropdown() {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  applyFilter() {
    let filtered = this.expenseService.getAll();

    if (this.filter.fromDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(this.filter.fromDate));
    }

    if (this.filter.toDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(this.filter.toDate));
    }

    if (this.filter.selectedCategoryIds.length) {
      filtered = filtered.filter(e => this.filter.selectedCategoryIds.includes(e.category_id));
    }

    this.expenses = filtered;
    this.isFilterDropdownOpen = false;
  }
  
  clearFilter() {
    this.filter.fromDate = '';
    this.filter.toDate = '';
    this.filter.selectedCategoryIds = [];
    this.listExpenses(); // Reload the expenses after clearing the filter
  }

  onCategoryCheckboxChange(event: Event, categoryId: string) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filter.selectedCategoryIds.push(categoryId);
    } else {
      this.filter.selectedCategoryIds = this.filter.selectedCategoryIds.filter(id => id !== categoryId);
    }
  }
}
