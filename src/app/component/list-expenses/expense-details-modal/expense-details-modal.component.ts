import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-expense-details-modal',
  templateUrl: './expense-details-modal.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ExpenseDetailsModalComponent {
  @Input() selectedExpense: any;
  @Input() currency: string | null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<any>();

  constructor() {
    this.currency = '';
  }

  close() {
    this.closeModal.emit();
  }

  editDetails() {
    this.edit.emit(this.selectedExpense);
  }

  onDelete() {
    this.delete.emit(this.selectedExpense.expense_id);
  }
}
