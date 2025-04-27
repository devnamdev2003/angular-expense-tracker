import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { CategoryService } from '../../service/localStorage/category.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';
@Component({
  selector: 'app-list-expenses',
  imports: [CommonModule],
  templateUrl: './list-expenses.component.html',
  styleUrls: ['./list-expenses.component.css']
})
export class ListExpensesComponent implements OnInit {
  expenses: any[] = [];
  categories: any[] = [];
  categoryMap: { [key: string]: string } = {};
  sortDirections: { [key: number]: boolean } = {};

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.listExpenses();
  }

  listExpenses() {
    try {
      this.expenses = this.expenseService.getAll();
      this.categories = this.categoryService.getAll();

      this.categoryMap = Object.fromEntries(
        this.categories.map(c => [c.category_id, c.name])
      );
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  }

  getFormattedDate(expense: any): string {
    const expDate = new Date(expense.date);
    const timeParts = expense.time.split(":");
    return `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')} ${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
  }

  sortTable(colIndex: number) {
    this.sortDirections[colIndex] = !this.sortDirections[colIndex];
    const direction = this.sortDirections[colIndex] ? 1 : -1;

    this.expenses.sort((a, b) => {
      let valA, valB;

      switch (colIndex) {
        case 0: // Amount
          valA = a.amount;
          valB = b.amount;
          break;
        case 1: // Category
          valA = a.category_name;
          valB = b.category_name;
          break;
        case 2: // Date
          valA = new Date(a.date + 'T' + a.time);
          valB = new Date(b.date + 'T' + b.time);
          break;
        case 3: // Payment Mode
          valA = a.payment_mode;
          valB = b.payment_mode;
          break;
        default:
          valA = '';
          valB = '';
      }

      if (valA instanceof Date && valB instanceof Date) {
        return direction * (valA.getTime() - valB.getTime());
      }

      if (!isNaN(valA) && !isNaN(valB)) {
        return direction * (valA - valB);
      }

      return direction * (valA.toString().toLowerCase().localeCompare(valB.toString().toLowerCase(), undefined, { numeric: true }));
    });
  }

  confirmDelete(id: string) {
    if (confirm("Are you sure you want to delete this expense?")) {
      const result = this.expenseService.delete(id);

      this.toastService.show("Expense deleted successfully", 'success');
      this.listExpenses(); // Refresh the list

    }
  }
}
