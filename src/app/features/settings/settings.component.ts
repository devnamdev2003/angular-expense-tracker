import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../service/localStorage/user.service';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingItemComponent } from '../../component/setting-item/setting-item.component';
import { CategoryService } from '../../service/localStorage/category.service';
import { CategoryDropdownComponent } from '../../component/category-dropdown/category-dropdown.component';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    CommonModule,
    SettingItemComponent,
    ReactiveFormsModule,
    CategoryDropdownComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent {
  isDarkMode = false;

  addCategoryForm!: FormGroup;
  deleteCategoryForm!: FormGroup;
  showAddCategoryModal = false;
  showDeleteCategoryModal = false;
  selectedCategoryName: string = 'Select Category';
  userAgent: string = '';
  platform: string = '';

  constructor(
    public userService: UserService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    const savedTheme = this.userService.getValue<string>('theme_mode') ?? 'light';
    this.isDarkMode = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    const existingCategories = this.categoryService.getAll();
    const names = existingCategories.map(cat => cat.name);
    const icons = existingCategories.map(cat => cat.icon);
    const colors = existingCategories.map(cat => cat.color);

    this.addCategoryForm = this.fb.group({
      name: ['', [Validators.required, this.nameExistsValidator(names)]],
      icon: ['', [Validators.required, this.iconExistsValidator(icons)]],
      color: ['#000000', [Validators.required, this.colorExistsValidator(colors)]],
    });

    const allExpenses = this.expenseService.getAll();
    const usedCategoryIds = allExpenses.map(exp => exp.category_id);
    // const defaultCategoryIds = existingCategories.filter(item => item.user_id == '0').map(cat => cat.category_id);
    this.deleteCategoryForm = this.fb.group({
      category_id: ['', [Validators.required, this.categoryInUseValidator(usedCategoryIds)]],
    });

    this.userAgent = navigator.userAgent;
    this.platform = navigator.platform;
  }

  toggleTheme(): void {
    const savedTheme = this.userService.getValue<string>('theme_mode') ?? 'light';
    if (savedTheme === 'dark') {
      this.isDarkMode = false;
    }
    else {
      this.isDarkMode = true;
    }
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    this.userService.update('theme_mode', this.isDarkMode ? 'dark' : 'light');
  }

  confirmAndDownload(): void {
    const confirmed = confirm('Are you sure you want to download your data as a JSON file?');
    if (!confirmed) return;

    const data = this.expenseService.getAll();

    // Filter out unwanted fields
    const filteredData = data.map(expense => ({
      amount: expense.amount,
      date: expense.date,
      time: expense.time,
      location: expense.location,
      note: expense.note,
      payment_mode: expense.payment_mode,
      category_name: expense.category_name,
      category_id: expense.category_id,
      expense_id: expense.expense_id,
    }));

    const jsonData = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  addCategory(): void {
    if (this.addCategoryForm.invalid) {
      this.addCategoryForm.markAllAsTouched();
      return;
    }
    const { name, icon, color } = this.addCategoryForm.value;
    this.categoryService.add({ name, icon, color, is_active: '1', expense_count: 0 });
    this.toastService.show('Category added successfully!', 'success');;
    this.closeCategoryModal();
    this.addCategoryForm.reset();
  }

  onCategorySelected(category: any) {
    this.deleteCategoryForm.patchValue({ category_id: category.category_id });
    this.selectedCategoryName = category.name;
  }

  deleteCategory(): void {
    if (this.deleteCategoryForm.invalid) {
      this.deleteCategoryForm.markAllAsTouched();
      return;
    }
    const category_id = this.deleteCategoryForm.value;
    this.categoryService.delete(category_id.category_id);
    this.toastService.show(`Category deleted succesfully.`, 'success');
    this.closeDeleteCategoryModal();
  }

  openCategoryModal(): void {
    this.addCategoryForm.reset();
    this.showAddCategoryModal = true;
  }

  openDeleteCategoryModal(): void {
    this.deleteCategoryForm.reset();
    this.showDeleteCategoryModal = true;
  }

  closeCategoryModal() {
    this.showAddCategoryModal = false;
  }

  closeDeleteCategoryModal() {
    this.selectedCategoryName = "Select Category";
    this.showDeleteCategoryModal = false;
    this.deleteCategoryForm.reset();
  }

  nameExistsValidator(existingNames: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim().toLowerCase();
      if (!value) return null;
      const exists = existingNames.some(name => name.toLowerCase() === value);
      return exists ? { nameExists: true } : null;
    };
  }

  iconExistsValidator(existingIcons: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const exists = existingIcons.includes(value);
      return exists ? { iconExists: true } : null;
    };
  }

  colorExistsValidator(existingColors: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const exists = existingColors.includes(value);
      return exists ? { colorExists: true } : null;
    };
  }

  categoryInUseValidator(expenseCategories: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const inUse = expenseCategories.some(cat => cat === value);
      return inUse ? { categoryInUse: true } : null;
    };
  }

  defaultCategoryValidator(expenseCategories: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const inUse = expenseCategories.some(cat => cat === value);
      return inUse ? { defaultCategory: true } : null;
    };
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // ✅ Check if file is selected
    if (!file) {
      this.toastService.show('No file selected.', 'warning');
      return;
    }

    // ✅ Validate file type (accept only .json)
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      this.toastService.show('Only JSON files are allowed.', 'error');
      input.value = '';
      return;
    }

    // ✅ (Optional) Validate file size (e.g., max 1MB)
    const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSizeInBytes) {
      this.toastService.show('File size exceeds 1MB limit.', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const content = reader.result as string;

        // ✅ Validate JSON parse
        const json = JSON.parse(content);
        if (!Array.isArray(json)) throw new Error('JSON must be an array of expense objects.');

        // ✅ Validate each item
        const validData = json.filter(item =>
          typeof item.amount === 'number' &&
          typeof item.date === 'string' &&
          typeof item.time === 'string' &&
          typeof item.category_id === 'string' &&
          typeof item.payment_mode === 'string' &&
          typeof item.note === 'string' &&
          typeof item.location === 'string'
        );

        if (validData.length === 0) {
          this.toastService.show('No valid expenses found in the file.', 'warning');
          return;
        }

        // ✅ Confirm with user
        const confirmed = confirm(`Found ${validData.length} valid expenses. Do you want to import them?`);
        if (!confirmed) return;

        // ✅ Import data
        for (const expense of validData) {
          this.expenseService.add(expense);
        }

        this.toastService.show('Data imported successfully!', 'success');
      } catch (e) {
        console.error('Error parsing file:', e);
        this.toastService.show('Invalid JSON structure.', 'error');
      } finally {
        // ✅ Reset input so same file can be uploaded again
        input.value = '';
      }
    };

    reader.onerror = () => {
      console.error('File reading error:', reader.error);
      this.toastService.show('Failed to read the file.', 'error');
      input.value = '';
    };

    reader.readAsText(file);
  }

}