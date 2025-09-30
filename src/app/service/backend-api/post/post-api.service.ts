import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { StorageService } from '../../localStorage/storage.service';
import { UserService } from '../../localStorage/user.service';
import { ToastService } from '../../toast/toast.service';
/**
 * Service to handle background POST requests to sync user data (expenses, budget, categories, etc.)
 * with the backend API. Intended to run silently once every 24 hours.
 */
@Injectable({
  providedIn: 'root'
})
export class PostApiService {

  /**
   * Creates an instance of PostApiService.
   * @param http Angular HttpClient to perform HTTP requests
   * @param configService Provides API base URL based on environment
   * @param storageService Accesses user data from LocalStorage
   * @param userService Manages user-specific values like `id` and `last_backup`
   * @param toastService Displays notifications to the user
   */
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private storageService: StorageService,
    private userService: UserService,
    private toastService: ToastService
  ) { }

  /**
   * Posts user data to the server in the background if more than 24 hours have passed
   * since the last successful backup. Uses `/api/post/` endpoint.
   */
  postUserData(): void {
    const lastBackupStr = this.userService.getValue<string>('last_backup');
    const now = new Date();
    const lastBackup = lastBackupStr ? new Date(lastBackupStr) : null;
    const shouldBackup = !lastBackup || (now.getTime() - lastBackup.getTime()) > 4 * 60 * 60 * 1000;

    if (shouldBackup) {
      // console.log('Posting user data in the background...');
      const url = this.configService.getapiUrl() + '/api/post/';
      const userData = this.getUserDataFromLocalStorage();

      this.http.post(url, userData).pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log('User data posted successfully. Response:', res);
          const api_response_app_version = res.app_version;
          const app_current_version = this.userService.getValue<string>('app_version');
          if (api_response_app_version != app_current_version) {
            this.userService.update('is_app_updated', false);
            setTimeout(() => {
              this.toastService.show('🚀 Update available! Please update from ⚙️ Settings.', 'info', 5000);
            }, 500);
          }
          this.userService.update('last_backup', now.toISOString());
          this.userService.update('has_music_url_access', res.has_music_url_access);
          this.userService.update('has_ai_access' , res.has_ai_access);
        },
        error: err => {
          console.error('Error posting user data', err);
        }
      });
    } else {
      //console.log('Backup skipped. Last backup was within 24 hours.');
    }
  }

  /**
   * Gathers all relevant user data from LocalStorage to be sent to the backend.
   *
   * @returns An object containing user_id, expenses, budget, category, and user_data
   * or `undefined` if user_id is not available.
   */
  getUserDataFromLocalStorage(): any {
    const userId = this.userService.getValue<string>('id');
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
