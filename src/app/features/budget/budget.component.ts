import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { Budget, BudgetService } from '../../service/localStorage/budget.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../service/toast/toast.service';
import { UserService } from '../../service/localStorage/user.service';

/**
 * Component responsible for managing budget creation, editing, progress tracking,
 * and displaying insights such as average spending per day.
 *
 * Features:
 * - Add, edit, and delete budget records stored in LocalStorage.
 * - Calculate budget progress, remaining amount, and daily spending suggestions.
 * - Provide visual progress bar with dynamic colors and animated percentage.
 * - Integrates with ExpenseService to calculate expenses within the budget period.
 */
@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit {

  /**
   * Reactive form group to handle budget input fields (amount, fromDate, toDate).
   */
  budgetForm: FormGroup;

  /**
   * Array of all stored budgets fetched from the BudgetService.
   */
  budgets: Budget[] = [];

  /**
   * Controls the visibility of the add/edit budget modal dialog.
   */
  showModal = false;

  /**
   * Controls the visibility of the main budget section on the UI.
   * Becomes true if at least one budget exists.
   */
  showBudgetSection = false;

  /**
   * Stores the latest budget entry (most recent in the list).
   */
  latestBudget!: Budget;

  /**
   * Percentage of the budget spent, between 0 and 100.
   */
  budgetProgress = 0;

  /**
   * CSS class for the progress bar color (changes dynamically based on usage).
   */
  budgetColorClass = 'bg-green-500';

  /**
   * Text message summarizing budget usage and remaining amount.
   */
  budgetMessage = '';

  /**
   * Average amount allowed to spend per day over the entire budget period.
   */
  avgAllowedPerDay = 0;

  /**
   * Average amount actually spent per day so far in the budget period.
   */
  avgSpentPerDay = 0;

  /**
   * Suggested daily spending for the remaining days to stay within budget.
   */
  suggestedPerDay = 0;

  /**
   * Indicates whether the modal is currently in "edit" mode (true) or "add" mode (false).
   */
  isEditMode = false;

  /**
   * User's preferred currency symbol or code (retrieved from UserService).
   */
  currency: string | null;

  /**
   * Whether dark mode is enabled in the UI (based on user settings).
   */
  isDarkMode: boolean = false;

  /**
   * Animated progress value used for smooth progress bar transitions.
   */
  animatedBudgetProgress = 0;

  /**
   * Animated percentage value displayed as the budget percentage increases smoothly.
   */
  displayedPercentage = 0;

  /**
   * Creates an instance of BudgetComponent.
   *
   * @param expenseService Service for retrieving expenses from LocalStorage.
   * @param budgetService Service for creating, updating, and deleting budgets.
   * @param toastService Service for displaying success/error notifications.
   * @param fb Angular FormBuilder for constructing the reactive form.
   * @param userService Service for retrieving user-specific settings (currency, theme).
   */
  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private userService: UserService,
  ) {
    // Load user currency preference
    this.currency = this.userService.getValue<string>('currency');

    // Initialize the reactive form
    this.budgetForm = this.createForm();

    // Check and apply theme settings
    const savedTheme = this.userService.getValue<string>('theme_mode') ?? 'light';
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    }
    else {
      this.isDarkMode = false;
    }
  }

  /**
   * Lifecycle hook that is called after component initialization.
   * Loads existing budgets and initializes the budget section if data exists.
   */
  ngOnInit(): void {
    this.loadBudgets();
  }

  /**
   * Creates and returns the reactive budget form with validation rules.
   *
   * @returns FormGroup instance with controls for amount, fromDate, and toDate.
   */
  createForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }

  /**
   * Opens the modal for adding a new budget.
   * Resets the form and disables edit mode.
   */
  openModal(): void {
    this.budgetForm.reset();
    this.isEditMode = false;
    this.showModal = true;
  }

  /**
   * Opens the modal for editing the latest budget.
   * Pre-fills the form with the latest budget's data.
   */
  openEditModal(): void {
    this.isEditMode = true;
    this.showModal = true;
    this.budgetForm.patchValue({
      amount: this.latestBudget.amount,
      fromDate: this.latestBudget.fromDate,
      toDate: this.latestBudget.toDate,
    });
  }

  /**
   * Closes the add/edit budget modal.
   */
  closeModal(): void {
    this.showModal = false;
  }

  /**
   * Handles form submission for adding or updating a budget.
   * Validates input, updates LocalStorage, and refreshes the budget list.
   */
  onSubmit(): void {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    const data = this.budgetForm.value;

    try {
      if (this.isEditMode) {
        this.budgetService.update(this.latestBudget.budget_id, data);
        this.toastService.show('Budget updated successfully!', 'success');
      } else {
        this.budgetService.add(data);
        this.toastService.show('Budget added successfully!', 'success');
      }

      this.loadBudgets();
      this.closeModal();
    } catch (error) {
      console.error('Submit failed:', error);
      this.toastService.show('Error saving budget.', 'error');
    }
  }

  /**
   * Loads all budgets from LocalStorage and sets the latest budget
   * as the active budget for progress calculations.
   */
  loadBudgets(): void {
    this.budgets = this.budgetService.getAll();
    this.showBudgetSection = this.budgets.length > 0;

    if (this.showBudgetSection) {
      this.latestBudget = this.budgets[this.budgets.length - 1];
      this.calculateBudgetProgress();
    }
  }

  /**
   * Calculates budget usage statistics including:
   * - Total spent amount in the budget period.
   * - Remaining budget.
   * - Progress percentage.
   * - Suggested per-day spending.
   *
   * Also updates UI elements such as progress bar color and budget message.
   */
  calculateBudgetProgress(): void {
    const totalBudget = parseFloat(this.latestBudget.amount.toString());
    const fromDate = new Date(this.latestBudget.fromDate);
    const toDate = new Date(this.latestBudget.toDate);

    // Filter expenses within the budget date range
    const expenses: Expense[] = this.expenseService.getAll();
    const expensesInRange = expenses.filter((exp: any) => {
      const date = new Date(exp.date);
      return date >= fromDate && date <= toDate;
    });

    // Calculate spent amount and percentage
    const spent = expensesInRange.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
    const percentage = Math.min((spent / totalBudget) * 100, 100);
    const remaining = Math.max(totalBudget - spent, 0);

    // Update progress values
    this.budgetProgress = percentage;
    this.animatedBudgetProgress = 0;
    this.displayedPercentage = 0;

    // Trigger animation after a small delay
    setTimeout(() => {
      this.animatedBudgetProgress = this.budgetProgress;
    }, 100);

    // Animate the percentage counter
    this.animatePercentage();

    // Dynamically change progress bar color based on usage
    if (percentage > 80) this.budgetColorClass = 'bg-red-500';
    else if (percentage > 50) this.budgetColorClass = 'bg-yellow-500';
    else if (percentage > 30) this.budgetColorClass = 'bg-blue-500';
    else this.budgetColorClass = 'bg-green-500';

    // Generate budget status message
    if (spent > totalBudget) {
      this.budgetMessage =
        `⚠️ You have exceeded your budget! You spent ${this.currency}${spent.toFixed(2)} ` +
        `which is ${this.currency}${(spent - totalBudget).toFixed(2)} over the limit set ` +
        `between ${this.latestBudget.fromDate} and ${this.latestBudget.toDate}. 😰`;
    } else {
      this.budgetMessage =
        `✅ You have spent ${this.currency}${spent.toFixed(2)} out of ` +
        `${this.currency}${totalBudget.toFixed(2)} between ` +
        `${this.latestBudget.fromDate} and ${this.latestBudget.toDate}. 💸 Remaining: ` +
        `${this.currency}${remaining.toFixed(2)}`;
    }

    // Calculate average daily insights
    const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const today = new Date();
    const elapsedDays = Math.max(Math.ceil((today.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const remainingDays = Math.max(totalDays - elapsedDays, 1);

    this.avgAllowedPerDay = totalBudget / totalDays;
    this.avgSpentPerDay = spent / elapsedDays;
    this.suggestedPerDay = remaining / remainingDays;
  }

  /**
   * Smoothly animates the budget percentage counter
   * from 0 to the calculated progress value.
   */
  animatePercentage(): void {
    const duration = 800;
    const steps = 40;
    const increment = this.budgetProgress / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.displayedPercentage = +(increment * currentStep).toFixed(1);

      if (currentStep >= steps) {
        this.displayedPercentage = +this.budgetProgress.toFixed(1);
        clearInterval(interval);
      }
    }, duration / steps);
  }

  /**
   * Deletes the latest budget after user confirmation
   * and updates the budget list.
   */
  deleteBudget(): void {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.delete(this.latestBudget.budget_id);
      this.toastService.show('Budget deleted successfully', 'success');
      this.closeModal();
    }
    this.loadBudgets();
  }
}
