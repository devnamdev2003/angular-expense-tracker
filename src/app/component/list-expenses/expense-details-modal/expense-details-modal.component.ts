import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryDropdownComponent } from "../../category-dropdown/category-dropdown.component";

/**
 * Modal component for displaying and editing expense details.
 *
 * Features:
 * - Shows details of a selected expense.
 * - Supports editing expense fields including category, amount, date, time, note, location, payment mode, and extra spending.
 * - Emits events to parent components for closing, deleting, or editing expenses.
 */
@Component({
  selector: 'app-expense-details-modal',
  templateUrl: './expense-details-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CategoryDropdownComponent],
})
export class ExpenseDetailsModalComponent implements OnInit {

  /** The currently selected expense object */
  @Input() selectedExpense: any;

  /** Currency symbol to display in the modal */
  @Input() currency: string | null = '';

  /** Whether the edit mode is currently open */
  @Input() isEditOpen: boolean = false;

  /** Event emitted when the modal should be closed */
  @Output() closeModal = new EventEmitter<void>();

  /** Event emitted when the selected expense should be deleted */
  @Output() delete = new EventEmitter<string>();

  /** Event emitted when the selected expense has been edited */
  @Output() edit = new EventEmitter<any>();

  /** Name of the currently selected category for editing */
  selectedCategoryName: string = 'Select Category';

  /** Form group for editing the expense */
  editForm!: FormGroup;

  /**
   * Creates an instance of ExpenseDetailsModalComponent.
   *
   * @param fb FormBuilder service for building reactive forms.
   */
  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  /** Angular lifecycle hook called on component initialization */
  ngOnInit(): void {}

  /**
   * Initializes the reactive edit form with default or selected expense values.
   */
  initForm(): void {
    this.editForm = this.fb.group({
      amount: [this.selectedExpense?.amount || '', [Validators.required]],
      category_id: [this.selectedExpense?.category_id || '', Validators.required],
      date: [this.selectedExpense?.date || '', Validators.required],
      time: [this.selectedExpense?.time || '', Validators.required],
      note: [this.selectedExpense?.note || ''],
      payment_mode: [this.selectedExpense?.payment_mode || '', Validators.required],
      location: [this.selectedExpense?.location || ''],
      isExtraSpending: [this.selectedExpense?.isExtraSpending || false]
    });
  }

  /**
   * Updates the form when a new category is selected from the dropdown.
   *
   * @param category The selected category object.
   */
  onCategorySelected(category: any): void {
    this.editForm.patchValue({ category_id: category.category_id });
  }

  /**
   * Toggles the edit mode of the modal.
   * Initializes the form with current expense values if edit mode is opened.
   */
  toggleEdit(): void {
    this.isEditOpen = !this.isEditOpen;
    if (this.isEditOpen) {
      this.selectedCategoryName = this.selectedExpense.category_name;
      this.initForm();
    }
  }

  /**
   * Submits the edited expense if the form is valid.
   * Emits the `edit` event with the updated expense data.
   */
  submitEdit(): void {
    if (this.editForm.valid) {
      const updatedExpense = {
        ...this.selectedExpense,
        ...this.editForm.value,
      };
      this.edit.emit(updatedExpense);
      this.toggleEdit();
    }
  }

  /** Emits the `closeModal` event to notify parent to close the modal */
  close(): void {
    this.closeModal.emit();
  }

  /** Emits the `delete` event with the selected expense ID */
  onDelete(): void {
    this.delete.emit(this.selectedExpense.expense_id);
  }
}
