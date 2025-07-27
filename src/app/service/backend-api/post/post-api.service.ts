import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { ConfigService } from '../../util/config/config.service';
import { StorageService } from '../../localStorage/storage.service';
import { UserService } from '../../localStorage/user.service';
@Injectable({
  providedIn: 'root'
})
export class PostApiService {
  constructor(private http: HttpClient, private configService: ConfigService, private storageService: StorageService, private userService: UserService) { }

  // Method to post user data silently
  postUserData() {
    const lastBackupStr = this.userService.getValue<string>('last_backup');
    const now = new Date();
    const lastBackup = lastBackupStr ? new Date(lastBackupStr) : null;
    const shouldBackup = !lastBackup || (now.getTime() - lastBackup.getTime()) > 24 * 60 * 60 * 1000;
    if (shouldBackup) {
      console.log('Posting user data in the background...');
      const url = this.configService.getapiUrl() + '/api/post/';
      const userData = this.getUserDataFromLocalStorage();
      this.http.post(url, userData).pipe(take(1)).subscribe({
        next: () => {
          console.log('User data posted successfully. Updating last_backup...');
          this.userService.update('last_backup', now.toISOString());
        },
        error: err => {
          console.error('Error posting user data', err);
        }
      });
    } else {
      console.log('Backup skipped. Last backup was within 24 hours.');
    }
  }

  getUserDataFromLocalStorage() {
    const userId = this.userService.getValue<string>('id')
    if (!userId) {
      console.warn('User ID is missing, skipping backup.');
      return;
    }
    const userData = this.storageService.getUser();
    const expenses = this.storageService.getAllExpenses();
    const budget = this.storageService.getAllBudgets();
    const categories = this.storageService.getAllCategories();
    return {
      user_id: userId,
      expenses: expenses || [],
      budget: budget || [],
      category: categories || [],
      user_data: userData || {}
    };
  }
}