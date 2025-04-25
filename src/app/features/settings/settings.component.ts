import { Component, OnInit } from '@angular/core';
import { BudgetService } from '../../localStorage/budget.service';
import { UserService } from '../../localStorage/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingItemComponent } from '../../component/setting-item/setting-item.component';
import { CustomModalComponent } from '../../component/custom-modal/custom-modal.component';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    CommonModule,
    SettingItemComponent,
    CustomModalComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent {
  isDarkMode = false;
  fromDate = '';
  toDate = '';
  amount: number | null = null;
  errorMessages = {
    fromDate: '',
    toDate: '',
    amount: ''
  };

  constructor(public budgetService: BudgetService,
    public userService: UserService,
    private toast: ToastService,
  ) { }





  toggleTheme(): void {
    const savedTheme = this.userService.getValue<string>('theme_mode');
    if (savedTheme === 'dark') {
      this.isDarkMode = false;
    }
    else {
      this.isDarkMode = true;
    }
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    this.userService.update('theme_mode', this.isDarkMode ? 'dark' : 'light');
  }


  showBudgetModal(): void {
    const allBudgets = this.budgetService.getAll();
    if (allBudgets.length > 0) {
      const latest = allBudgets[allBudgets.length - 1];
      this.fromDate = latest.fromDate;
      this.toDate = latest.toDate;
      this.amount = latest.amount;
    } else {
      this.fromDate = '';
      this.toDate = '';
      this.amount = null;
    }

    (document.getElementById('budgetModal') as HTMLDialogElement)?.showModal();
  }

  closeBudgetModal(): void {
    (document.getElementById('budgetModal') as HTMLDialogElement)?.close();
    this.errorMessages = { fromDate: '', toDate: '', amount: '' };
  }

  saveBudget(): void {
    this.errorMessages = { fromDate: '', toDate: '', amount: '' };
    let hasError = false;

    if (!this.fromDate) {
      this.errorMessages.fromDate = 'Please select start date.';
      hasError = true;
    }

    if (!this.toDate) {
      this.errorMessages.toDate = 'Please select end date.';
      hasError = true;
    }

    if (!this.amount || this.amount <= 0) {
      this.errorMessages.amount = 'Amount must be greater than 0.';
      hasError = true;
    }

    if (hasError) return;

    if (new Date(this.fromDate) > new Date(this.toDate)) {
      this.errorMessages.toDate = 'End date must be after start date.';
      return;
    }

    const allBudgets = this.budgetService.getAll();

    if (allBudgets.length > 0) {
      const latest = allBudgets[allBudgets.length - 1];
      this.budgetService.update(latest.budget_id, {
        fromDate: this.fromDate,
        toDate: this.toDate,
        amount: this.amount!,
      });
    } else {
      const overlapping = allBudgets.some(b =>
        new Date(this.fromDate) <= new Date(b.toDate) &&
        new Date(b.fromDate) <= new Date(this.toDate)
      );

      if (overlapping) {
        this.errorMessages.amount = 'A budget already exists in this date range!';
        return;
      }

      this.budgetService.add({
        fromDate: this.fromDate,
        toDate: this.toDate,
        amount: this.amount!,
      });
    }

    this.closeBudgetModal();
    this.toast.show('Budget saved successfully!', 'success');
  }
}
