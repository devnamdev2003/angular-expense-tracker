import { EventEmitter, Input, Output } from '@angular/core';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../../service/localStorage/expense.service';
import { CategoryService, Category } from '../../../service/localStorage/category.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-expense-details-modal',
  templateUrl: './expense-details-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ExpenseDetailsModalComponent implements OnInit {
  @Input() selectedExpense: any;
  @Input() currency: string | null = '';
  @Input() isEditOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<any>();

  categories: Category[] = [];
  selectedCategoryName: string = 'Select Category';
  isCategoryDropdownOpen: boolean = false;
  editForm!: FormGroup;
  @ViewChild('categorydownRef') categoryRef!: ElementRef;


  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadCategories();
  }


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


  loadCategories() {
    this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(category: any) {
    this.editForm.patchValue({ category_id: category.category_id });
    this.selectedCategoryName = category.name;
    this.isCategoryDropdownOpen = false;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.isCategoryDropdownOpen &&
      this.categoryRef &&
      !this.categoryRef.nativeElement.contains(target)
    ) {
      this.isCategoryDropdownOpen = false;
    }
  }
}
