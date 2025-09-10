import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../service/localStorage/user.service';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingItemComponent } from '../../component/settings-components/setting-item/setting-item.component';
import { Category, CategoryService } from '../../service/localStorage/category.service';
import { CategoryDropdownComponent } from '../../component/category-dropdown/category-dropdown.component';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ToastService } from '../../service/toast/toast.service';
import { FormModelComponent } from '../../component/form-model/form-model.component';
import { DownloadComponentComponent } from '../../component/settings-components/download-component/download-component.component';

/**
 * @component
 * @description
 * Settings component for managing user preferences and categories.
 * 
 * Allows toggling dark mode, adding/deleting categories, and downloading data.
 */
@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    CommonModule,
    SettingItemComponent,
    ReactiveFormsModule,
    CategoryDropdownComponent,
    FormModelComponent,
    DownloadComponentComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent {
  /** Flag to toggle dark mode */
  isDarkMode = false;

  /** Form for adding a new category */
  addCategoryForm!: FormGroup;

  /** Form for deleting a category */
  deleteCategoryForm!: FormGroup;

  /** Modal visibility states */
  showAddCategoryModal = false;

  /** Modal visibility states */
  showDeleteCategoryModal = false;

  /** Name of the currently selected category (display only) */
  selectedCategoryName: string = 'Select Category';

  /** Flag to show delete category option based on user categories */
  showDeleteCategoryOption: boolean = false;

  /**
    * Constructor to inject dependencies
    * @param userService User service for managing user preferences
    * @param expenseService Expense service for managing expenses
    * @param categoryService Category service for managing categories
    * @param fb FormBuilder instance for creating reactive forms
    * @param toastService Toast service for showing notifications
    * @constructor
    * @memberof SettingsComponent
   */
  constructor(
    public userService: UserService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private toastService: ToastService,
  ) { }

  /** 
   * Initializes component state and loads existing categories
   * 
   * Lifecycle hook that initializes the component.
   */
  ngOnInit(): void {
    const savedTheme = this.userService.getValue<string>('theme_mode') ?? 'light';
    this.isDarkMode = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    const existingCategories: Category[] = this.categoryService.getAll();

    this.addCategoryForm = this.fb.group({
      name: ['', [Validators.required, this.nameExistsValidator()]],
      icon: ['', [Validators.required, this.iconExistsValidator()]],
      color: ['#000000', [Validators.required, this.colorExistsValidator()]],
    });

    const allExpenses = this.expenseService.getAll();
    const usedCategoryIds = allExpenses.map(exp => exp.category_id);
    // const defaultCategoryIds = existingCategories.filter(item => item.user_id == '0').map(cat => cat.category_id);
    this.deleteCategoryForm = this.fb.group({
      category_id: ['', [Validators.required, this.categoryInUseValidator(usedCategoryIds)]],
    });

    // Check if user has any custom categories
    let userId = this.userService.getValue<string>('id') || '0';
    this.showDeleteCategoryOption = existingCategories.some(cat => cat.user_id === userId);
  }

  /**
   * Toggle between light and dark themes.
   */
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

  /**
   * Add a new category using the form data.
   */
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
    this.showDeleteCategoryOption = true;
  }

  /**
   * Handles category selection from the dropdown.
   * @param category The selected category
   */
  onCategorySelected(category: any) {
    this.deleteCategoryForm.patchValue({ category_id: category.category_id });
    this.selectedCategoryName = category.name;
  }

  /**
   * Deletes the selected category after confirmation.
   */
  deleteCategory(): void {
    if (this.deleteCategoryForm.invalid) {
      this.deleteCategoryForm.markAllAsTouched();
      return;
    }
    const category_id = this.deleteCategoryForm.value;
    this.categoryService.delete(category_id.category_id);
    this.toastService.show(`Category deleted succesfully.`, 'success');
    this.closeDeleteCategoryModal();
    const existingCategories: Category[] = this.categoryService.getAll();
    let userId = this.userService.getValue<string>('id') || '0';
    this.showDeleteCategoryOption = existingCategories.some(cat => cat.user_id === userId);
  }

  /**
   * Opens the modal to add a new category.
   */
  openCategoryModal(): void {
    this.addCategoryForm.reset();
    this.showAddCategoryModal = true;
  }

  /**
   * Opens the modal to delete a category.
   */
  openDeleteCategoryModal(): void {
    this.deleteCategoryForm.reset();
    this.showDeleteCategoryModal = true;
  }

  /** Closes the add category modal */
  closeCategoryModal(): void {
    this.showAddCategoryModal = false;
  }

  /** Closes the delete category modal */
  closeDeleteCategoryModal(): void {
    this.selectedCategoryName = "Select Category";
    this.showDeleteCategoryModal = false;
    this.deleteCategoryForm.reset();
  }

  /** Validates if the category name already exists */
  nameExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const existingCategories: Category[] = this.categoryService.getAll();
      const existingNames = existingCategories.map(cat => cat.name);
      const value = control.value?.trim().toLowerCase();
      if (!value) return null;
      const exists = existingNames.some(name => name.toLowerCase() === value);
      return exists ? { nameExists: true } : null;
    };
  }

  /** Validates if the category icon already exists */
  iconExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const existingCategories: Category[] = this.categoryService.getAll();
      const existingIcons = existingCategories.map(cat => cat.icon);
      const value = control.value;
      if (!value) return null;
      const exists = existingIcons.includes(value);
      return exists ? { iconExists: true } : null;
    };
  }

  /** Validates if the category color already exists */
  colorExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const existingCategories: Category[] = this.categoryService.getAll();
      const existingColors = existingCategories.map(cat => cat.color);
      const value = control.value;
      if (!value) return null;
      const exists = existingColors.includes(value);
      return exists ? { colorExists: true } : null;
    };
  }

  /** Validates if the category is in use by any expense */
  categoryInUseValidator(expenseCategories: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const inUse = expenseCategories.some(cat => cat === value);
      return inUse ? { categoryInUse: true } : null;
    };
  }

  /** Validates if the category is a default category */
  defaultCategoryValidator(expenseCategories: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const inUse = expenseCategories.some(cat => cat === value);
      return inUse ? { defaultCategory: true } : null;
    };
  }

  /** Reference to the file input element for importing expenses */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** Opens the file input dialog to select a JSON file for import */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /** Handles the file upload and processes the JSON data */
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
          typeof item.location === 'string' &&
          typeof item.isExtraSpending === 'boolean'
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

  /**
   * Updates the application by clearing caches and reloading the page.
   * This is useful for applying updates or changes to the app.
   */
  updateApp() {
    if ('caches' in window) {
      caches.keys().then((names: string[]) => {
        names.forEach(name => caches.delete(name));
      }).finally(() => {
        this.userService.update('is_app_updated', true);
        (window as Window).location.reload();
      });
    } else {
      this.userService.update('is_app_updated', true);
      (window as Window).location.reload();
    }
  }
}