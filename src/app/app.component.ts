import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './shared/global-loader/global-loader.component';
import { InstallAppPopupComponentComponent } from './component/install-app-popup-component/install-app-popup-component.component';

import { SyncSchemaService } from './service/localStorage/sync-schema.service';
import { UserService } from './service/localStorage/user.service';
import { GlobalLoaderService } from './service/global-loader/global-loader.service';
import { PostApiService } from './service/backend-api/post/post-api.service';
import { ToastService } from './service/toast/toast.service';

/**
 * Root component of the application.
 * Manages global state, mobile view detection, section tracking,
 * theme application, schema syncing, and PWA update activation.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    GlobalLoaderComponent, CommonModule, InstallAppPopupComponentComponent, RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  /**
   *  PWA installation prompt event
   */
  deferredPrompt: any;

  /**
   *  Flag to control the display of the installation prompt
   */
  showInstallButton = false;

  /**
   * Constructor for AppComponent.
   * Initializes route tracking, section updates, PWA update listener, and services.
   * 
   * @param userService Service for managing user preferences
   * @param loader Global loader overlay service
   * @param storageService Local storage schema sync service
   * @param postApiService Backend API post service
   * @param toastService Service for displaying toast notifications
   * @param platformId Angular platform ID to check if running in browser
   */
  constructor(
    public userService: UserService,
    private loader: GlobalLoaderService,
    private postApiService: PostApiService,
    private toastService: ToastService,
    private syncSchemaService: SyncSchemaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  /**
   * Angular lifecycle hook called after component initialization.
   * Applies theme, syncs schema, sets user ID, and shows loader.
   */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      this.loader.show();
      setTimeout(() => {
        this.loader.hide();
      }, 500);

      this.syncSchemaService.syncAllSchema();

      // Apply saved theme mode
      const savedTheme = this.userService.getValue<string>('theme_mode');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Ensure user ID exists
      let userId = this.userService.getValue<string>('id');
      if (!userId) {
        userId = this.generateUserId();
        this.userService.update('id', userId);
      } else {
        this.postApiService.postUserData();
      }

      // Show update toast if app is not updated
      if (!this.isAppUpdated()) {
        setTimeout(() => {
          this.toastService.show('🚀 Update available! Please update from ⚙️ Settings.', 'info', 5000);
        }, 500);
      }

      // Listen for PWA installation prompt
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.deferredPrompt = event;
        this.showInstallButton = true;
      });
    }
  }

  /**
   * Disables the context menu on right-click for the whole app.
   * @param event Mouse event object
   */
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  /**
   * Generates a unique user ID by combining timestamp and random string.
   * @returns Generated user ID string
   */
  private generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }

  /**
   * Checks if the application is updated.
   * @returns True if the app is updated, false otherwise.
   */
  isAppUpdated(): boolean {
    return this.userService.getValue<boolean>('is_app_updated') ?? false;
  }

  /**
   * Triggers the PWA installation prompt if available.
   */
  installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          this.showInstallButton = false;
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
      });
    }
  }
}
