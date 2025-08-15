import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryDropdownComponent } from "../../category-dropdown/category-dropdown.component";

@Component({
  selector: 'app-expense-details-modal',
  templateUrl: './expense-details-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CategoryDropdownComponent],
})
export class ExpenseDetailsModalComponent implements OnInit {
  @Input() selectedExpense: any;
  @Input() currency: string | null = '';
  @Input() isEditOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<any>();
  selectedCategoryName: string = 'Select Category';
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {
    this.initForm();
  }

  ngOnInit() { }

  initForm() {
    this.editForm = this.fb.group({
      amount: [this.selectedExpense?.amount || '', [Validators.required]],
      category_id: [this.selectedExpense?.category_id || '', Validators.required],
      date: [this.selectedExpense?.date || '', Validators.required],
      time: [this.selectedExpense?.time || '', Validators.required],
      note: [this.selectedExpense?.note || ''],
      payment_mode: [this.selectedExpense?.payment_mode || '', Validators.required],
      location: [this.selectedExpense?.location || '']
    });
  }

  onCategorySelected(category: any) {
    this.editForm.patchValue({ category_id: category.category_id });
  }

  toggleEdit() {
    this.isEditOpen = !this.isEditOpen;
    if (this.isEditOpen) {
      this.selectedCategoryName = this.selectedExpense.category_name;
      this.initForm();
    }
  }

  submitEdit() {
    if (this.editForm.valid) {
      const updatedExpense = {
        ...this.selectedExpense,
        ...this.editForm.value,
      };
      this.edit.emit(updatedExpense);
      this.toggleEdit();
    }
  }

  close() {
    this.closeModal.emit();
  }

  onDelete() {
    this.delete.emit(this.selectedExpense.expense_id);
  }
}