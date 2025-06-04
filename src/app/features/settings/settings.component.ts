import { Component } from '@angular/core';
import { UserService } from '../../service/localStorage/user.service';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingItemComponent } from '../../component/setting-item/setting-item.component';
import { CategoryService } from '../../service/localStorage/category.service';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    CommonModule,
    SettingItemComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent {
  isDarkMode = false;

  addCategoryForm!: FormGroup;
  deleteCategoryForm!: FormGroup;
  showcategoryModal = false;
  showdeleteCategoryModal = false;

  constructor(
    public userService: UserService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const savedTheme = this.userService.getValue<string>('theme_mode') ?? 'light';
    this.isDarkMode = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', this.isDarkMode);

    this.addCategoryForm = this.fb.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
      color: ['#000000', Validators.required],
    });

    this.deleteCategoryForm = this.fb.group({
      name: ['', Validators.required],
    });
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
    if (this.addCategoryForm.invalid) return;

    const { name, icon, color } = this.addCategoryForm.value;
    this.categoryService.add({ name, icon, color, is_active: '1', expense_count: 0 });
    alert('Category added successfully!');
    (document.getElementById('categoryModal') as HTMLDialogElement)?.close();
    this.addCategoryForm.reset();
  }

  deleteCategory(): void {
    const name = this.deleteCategoryForm.value.name.trim();
    if (!name) return;

    this.categoryService.delete(name);
    alert(`Category "${name}" deleted (if it existed).`);
    (document.getElementById('deleteCategoryModal') as HTMLDialogElement)?.close();
    this.deleteCategoryForm.reset();
  }

  openCategoryModal(): void {
    this.addCategoryForm.reset();
    this.showcategoryModal = true;
  }

  openDeleteCategoryModal(): void {
    this.deleteCategoryForm.reset();
    this.showdeleteCategoryModal = true;
  }

  closeCategoryModal() {
    this.showcategoryModal = false;
  }

  closeDeleteCategoryModal() {
    this.showdeleteCategoryModal = false;
  }
}
