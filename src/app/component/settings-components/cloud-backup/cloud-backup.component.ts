import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ToastService } from '../../../service/toast/toast.service';
import { PostApiService } from '../../../service/backend-api/post/post-api.service';
import { UserService } from '../../../service/localStorage/user.service';

@Component({
  selector: 'app-cloud-backup',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cloud-backup.component.html',
  styleUrls: ['./cloud-backup.component.css']
})
export class CloudBackupComponent {

  constructor(private toastService: ToastService, private postApiService: PostApiService, private userService: UserService) {
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
    this.postApiService.postUserData();
    this.isBackupModalOpen.set(true);
  }

  closeBackupModal() {
    this.isBackupModalOpen.set(false);
  }

  // Generate Backup Key
  generateBackupKey() {
    // Generate a random UUID-like string for the key
    const newKey = crypto.randomUUID ? crypto.randomUUID() : 'bkp-8f2a-4c91-b3d5-e7f620a1';
    this.backupKey.set(newKey);
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

  // Restore Data Simulation
  async restoreData() {
    const key = this.restoreInput().trim();
    if (!key) return;

    this.isRestoring.set(true);

    // Simulate API Network Request delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    this.isRestoring.set(false);

    // Validate dummy key (simulate an error logic)
    if (key.length < 10) {
      this.toastService.show('Invalid backup key provided.', 'error');
    } else {
      this.toastService.show('Data successfully restored from backup!', 'success');
      this.closeRestoreModal(); // Automatically close the modal on success
    }
  }
}
