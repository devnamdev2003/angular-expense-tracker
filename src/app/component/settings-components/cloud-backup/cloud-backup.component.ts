import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ToastService } from '../../../service/toast/toast.service';
import { PostApiService } from '../../../service/backend-api/post/post-api.service';
import { UserService } from '../../../service/localStorage/user.service';
import { BackupKeyService } from '../../../service/backend-api/get/backup-key.service';
import { CategoryService } from '../../../service/localStorage/category.service';
import { SalaryService } from '../../../service/localStorage/salary.service';
import { ExpenseService } from '../../../service/localStorage/expense.service';
import { RestoreDataService } from '../../../service/backend-api/get/restore-data.service';
import { StorageService } from '../../../service/localStorage/storage.service';

@Component({
  selector: 'app-cloud-backup',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cloud-backup.component.html',
  styleUrls: ['./cloud-backup.component.css']
})
export class CloudBackupComponent {

  constructor(
    private toastService: ToastService,
    private postApiService: PostApiService,
    private userService: UserService,
    private backupKeyService: BackupKeyService,
    private categoryService: CategoryService,
    private salaryService: SalaryService,
    private expenseService: ExpenseService,
    private restoreDataService: RestoreDataService,
    private storageService: StorageService
  ) {
    this.autoBackupEnabled.set(this.userService.getValue<boolean>('is_backup_enable') || false);
  }

  // Backup States
  autoBackupEnabled = signal<boolean>(false);
  isSyncing = signal<boolean>(false);
  backupKey = signal<string | null>(null);

  // Modal States
  isBackupModalOpen = signal<boolean>(false);
  isRestoreModalOpen = signal<boolean>(false);

  // Restore States
  restoreInput = signal<string>('');
  isRestoring = signal<boolean>(false);

  // Toggle Auto Backup
  toggleAutoBackup() {
    this.autoBackupEnabled.update(val => !val);
    this.userService.update('is_backup_enable', this.autoBackupEnabled());
    this.toastService.show(
      this.autoBackupEnabled() ? 'Auto backup enabled' : 'Auto backup disabled',
      'success'
    );
  }

  // Cloud Sync Simulation
  syncToCloud() {
    this.isSyncing.set(true);

    // Simulate API call
    this.postApiService.postUserData(true);

    this.isSyncing.set(false);
  }

  // Modal Controls for Backup Key
  openBackupModal() {

    this.backupKey.set(null);

    this.backupKeyService.getBackupKey().subscribe({
      next: (res: any) => {

        if (!res || !res.data_backup_key) {
          this.toastService.show('Invalid response from server.', 'error');
          return;
        }
        this.isBackupModalOpen.set(true);
        this.backupKey.set(res.data_backup_key);
      },

      error: (err: Error) => {
        this.toastService.show(err.message, 'error');
        this.isBackupModalOpen.set(false);
      },
    });
  }

  closeBackupModal() {
    this.isBackupModalOpen.set(false);
    this.backupKey.set(null);
  }

  // Copy Key to Clipboard
  copyBackupKey() {
    const key = this.backupKey();
    if (key) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(key).then(() => {
          this.toastService.show('The key is copied', 'success');
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = key;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          this.toastService.show('The key is copied', 'success');
        } catch (err) {
          this.toastService.show('Failed to copy key', 'error');
        }
        document.body.removeChild(textArea);
      }
    }
  }

  // Modal Controls for Restore
  openRestoreModal() {
    this.isRestoreModalOpen.set(true);
  }

  closeRestoreModal() {
    if (this.isRestoring()) return;
    this.isRestoreModalOpen.set(false);
    this.restoreInput.set(''); // Clear input on close
  }

  // Update Restore Input without ngModel
  onRestoreInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.restoreInput.set(target.value);
  }

  restoreData() {
    const key = this.restoreInput().trim();
    if (!key) return;

    const confirmRestore = confirm(
      'Restoring will delete your current data and replace it with backup data.\n\nDo you want to continue?'
    );

    if (!confirmRestore) return;

    this.isRestoring.set(true);

    // STEP 1: Backup current data (rollback safety)
    const backup = {
      user: this.userService.getUserData() || {},
      categories: this.categoryService.getAll(),
      salaries: this.salaryService.getAll(),
      expenses: this.expenseService.getAll()
    };

    this.restoreDataService.getBackupData(key).subscribe({
      next: (json: any) => {

        try {
          // STEP 2: Validate response BEFORE deleting old data
          if (!json?.userData) {
            throw new Error('Invalid backup data');
          }

          // STEP 3: Clear old data ONLY AFTER validation
          this.storageService.resetAllData();

          // STEP 4: Save restored data
          this.userService.updateUserData(json.userData);

          const validCategories = json.categoryData.filter(
            (cat: any) => cat.user_id !== "0"
          );
          this.categoryService.addBulk(validCategories);

          this.salaryService.updateAllSalaries(json.salaryData);

          const validData = json.expenseData.filter((item: any) =>
            typeof item.amount === 'number' &&
            typeof item.date === 'string'
          );

          this.expenseService.addBulk(validData);

          this.toastService.show(
            'Data successfully restored from cloud!',
            'success'
          );

          this.closeRestoreModal();
        } catch (err) {

          // STEP 5: ROLLBACK if restore fails
          this.userService.updateUserData(backup.user);
          this.categoryService.addBulk(backup.categories);
          this.salaryService.updateAllSalaries(backup.salaries);
          this.expenseService.addBulk(backup.expenses);

          this.toastService.show(
            'Restore failed. Previous data restored.',
            'error'
          );
        }

        this.isRestoring.set(false);
      },

      error: (err: any) => {
        this.toastService.show(err?.message || 'Restore failed.', 'error');
        this.isRestoring.set(false);
      }
    });
  }
}
