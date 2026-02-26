import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalService, Goal } from '../../../service/localStorage/goal.service';
import { SavingsService, Saving } from '../../../service/localStorage/savings.service';
import { ConfigService } from '../../../service/config/config.service';

@Component({
  selector: 'app-saving',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './saving.component.html',
  styleUrl: './saving.component.css'
})
export class SavingComponent implements OnInit {
  currentGoal: Goal | null = null;
  savings: Saving[] = [];

  showSavingModal = false;
  showGoalModal = false;
  showGoalDetailsModal = false;
  editingSavingId: string | null = null;

  // Submission flags to trigger error messages only when trying to save
  savingFormSubmitted = false;
  goalFormSubmitted = false;

  todayDateStr = '';
  savingForm: Partial<Saving> = {};
  goalForm: Partial<Goal> = {};

  // Dashboard Stats
  totalSavedAmount = 0;
  goalTarget = 0;
  progressPercentage = 0;
  remainingPercentage = 0;
  currentMonthAdded = 0;
  averageSavedPerDay = 0;

  constructor(
    private goalService: GoalService,
    private savingsService: SavingsService,
    private configService: ConfigService
  ) {
    this.todayDateStr = this.configService.getLocalTime().split('T')[0];
  }

  ngOnInit() {
    this.refreshData();
  }

  refreshData(): void {
    this.currentGoal = this.goalService.getAll()[0] || null;
    this.savings = this.savingsService.getAll() || [];
    this.calculateStats();
  }

  calculateStats() {
    this.totalSavedAmount = this.savings.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    this.goalTarget = Number(this.currentGoal?.target_amount || 0);

    const progress = this.goalTarget > 0 ? (this.totalSavedAmount / this.goalTarget) * 100 : 0;
    this.progressPercentage = Math.min(Math.max(progress, 0), 100);
    this.remainingPercentage = Math.max(100 - this.progressPercentage, 0);

    const now = new Date();
    this.currentMonthAdded = (this.goalTarget - this.totalSavedAmount) > 0 ? this.goalTarget - this.totalSavedAmount : 0;

    if (this.currentGoal?.start_date && this.totalSavedAmount > 0) {
      const start = new Date(this.currentGoal.start_date).getTime();
      const today = new Date().getTime();
      let days = Math.ceil((today - start) / (1000 * 3600 * 24));
      this.averageSavedPerDay = this.totalSavedAmount / (days <= 0 ? 1 : days);
    } else {
      this.averageSavedPerDay = 0;
    }
  }

  /* ---------- Saving Form Validation Getters ---------- */

  get savingAmountError(): string | null {
    if (!this.savingForm.amount || this.savingForm.amount <= 0) return "Amount must be greater than zero.";
    if (this.savingForm.amount > 100000000) return "Amount cannot exceed ₹100,000,000.";
    return null;
  }

  get savingDateError(): string | null {
    if (!this.savingForm.date) return "Date is required.";
    if (new Date(this.savingForm.date) > new Date(this.todayDateStr)) return "Date cannot be in the future.";
    return null;
  }

  get savingNoteError(): string | null {
    if (this.savingForm.note && this.savingForm.note.length > 100) return "Note cannot exceed 100 characters.";
    return null;
  }

  get isSavingFormValid(): boolean {
    return !this.savingAmountError && !this.savingDateError && !this.savingNoteError;
  }

  /* ---------- Goal Form Validation Getters ---------- */

  get goalNameError(): string | null {
    if (!this.goalForm.goal_name || this.goalForm.goal_name.trim() === '') return "Goal Name is required.";
    if (this.goalForm.goal_name.length > 50) return "Goal Name cannot exceed 50 characters.";
    return null;
  }

  get goalAmountError(): string | null {
    if (!this.goalForm.target_amount || this.goalForm.target_amount <= 0) return "Target Amount must be greater than zero.";
    if (this.goalForm.target_amount > 100000000) return "Target Amount cannot exceed ₹100,000,000.";
    return null;
  }

  get goalStartDateError(): string | null {
    if (!this.goalForm.start_date) return "Start Date is required.";
    if (this.goalForm.start_date && this.goalForm.target_date && new Date(this.goalForm.start_date) > new Date(this.goalForm.target_date)) {
      return "Start Date cannot be after the Target Date.";
    }
    return null;
  }

  get goalTargetDateError(): string | null {
    if (!this.goalForm.target_date) return "Target Date is required.";
    return null;
  }

  get goalNoteError(): string | null {
    if (this.goalForm.note && this.goalForm.note.length > 100) return "Note cannot exceed 100 characters.";
    return null;
  }

  get isGoalFormValid(): boolean {
    return !this.goalNameError && !this.goalAmountError && !this.goalStartDateError && !this.goalTargetDateError && !this.goalNoteError;
  }

  /* ---------- Actions ---------- */

  saveSavingsData() {
    this.savingFormSubmitted = true;

    if (!this.isSavingFormValid) return;

    const savingData: Saving = {
      saving_id: this.editingSavingId || 'sav_' + Date.now(),
      amount: Number(this.savingForm.amount),
      date: this.savingForm.date!,
      note: this.savingForm.note || ''
    };

    if (this.editingSavingId) {
      this.savingsService.update(this.editingSavingId, savingData);
    } else {
      this.savingsService.add(savingData);
    }

    this.closeModals();
    this.refreshData();
  }

  saveGoalData() {
    this.goalFormSubmitted = true;

    if (!this.isGoalFormValid) return;

    const goalData: Goal = {
      goal_id: this.currentGoal?.goal_id || 'goal_' + Date.now(),
      goal_name: this.goalForm.goal_name!,
      target_amount: Number(this.goalForm.target_amount),
      start_date: this.goalForm.start_date!,
      target_date: this.goalForm.target_date || '',
      note: this.goalForm.note || ''
    };

    if (this.currentGoal) {
      this.goalService.update(goalData.goal_id, goalData);
    } else {
      this.goalService.add(goalData);
    }

    this.closeModals();
    this.refreshData();
  }

  deleteSaving(id: string) {
    if (confirm('Delete this saving record?')) {
      this.savingsService.delete(id);
      this.refreshData();
    }
  }

  deleteGoal() {
    if (confirm('Delete your entire goal? Progress will be kept but the target will be removed.')) {
      if (this.currentGoal) {
        this.goalService.delete(this.currentGoal.goal_id);
        this.currentGoal = null;
        this.refreshData();
      }
      this.closeModals();
    }
  }

  // --- Modal Control ---
  openAddModal() {
    this.savingFormSubmitted = false;
    this.editingSavingId = null;
    this.savingForm = { amount: undefined, date: this.todayDateStr, note: '' };
    this.showSavingModal = true;
  }

  editSaving(saving: Saving) {
    this.savingFormSubmitted = false;
    this.editingSavingId = saving.saving_id;
    this.savingForm = { ...saving };
    this.showSavingModal = true;
  }

  openGoalModal() {
    this.goalFormSubmitted = false;
    this.showGoalDetailsModal = false;
    this.goalForm = this.currentGoal ? { ...this.currentGoal } : {
      goal_name: '', target_amount: undefined, start_date: this.todayDateStr, target_date: '', note: ''
    };
    this.showGoalModal = true;
  }

  handleGoalCardClick() {
    this.currentGoal ? (this.showGoalDetailsModal = true) : this.openGoalModal();
  }

  closeModals() {
    this.showSavingModal = false;
    this.showGoalModal = false;
    this.showGoalDetailsModal = false;
    this.savingFormSubmitted = false;
    this.goalFormSubmitted = false;
  }
}