import { Component } from '@angular/core';
import { UserService } from '../../service/localStorage/user.service';
import { ExpenseService } from '../../service/localStorage/expense.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingItemComponent } from '../../component/setting-item/setting-item.component';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    CommonModule,
    SettingItemComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent {
  isDarkMode = false;

  constructor(
    public userService: UserService,
    private expenseService: ExpenseService,
  ) { }

  ngOnInit(): void {
    const savedTheme = this.userService.getValue<string>('theme_mode') ?? 'light';
    this.isDarkMode = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', this.isDarkMode);
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

}
