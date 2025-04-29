import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { CategoryService, Category } from '../../service/localStorage/category.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';
import { UserService } from '../../service/localStorage/user.service';

@Component({
  selector: 'app-list-expenses',
  imports: [CommonModule],
  templateUrl: './list-expenses.component.html',
  styleUrls: ['./list-expenses.component.css']
})

export class ListExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  categories: Category[] = [];
  currency: string | null;
  isSortByDropdownOpen: boolean = false;
  selectedFieldName: string = 'Sort By';
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

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
    if (
      this.isSortByDropdownOpen &&
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      this.isSortByDropdownOpen = false;
    }
  }
}
