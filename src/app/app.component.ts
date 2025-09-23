import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { GlobalLoaderComponent } from './shared/global-loader/global-loader.component';
import { AddExpenseComponent } from './features/add-expense/add-expense.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ListExpensesComponent } from './features/list-expenses/list-expenses.component';
import { HomeComponent } from './features/home/home.component';
import { CalendarComponent } from './features/calendar/calendar.component';
import { BudgetComponent } from './features/budget/budget.component';
import { AiComponent } from './features/ai/ai.component';
import { MusicComponent } from './features/music/music.component';
import { InstallAppPopupComponentComponent } from './component/install-app-popup-component/install-app-popup-component.component';

import { StorageService } from './service/localStorage/storage.service';
import { UserService } from './service/localStorage/user.service';
import { GlobalLoaderService } from './service/global-loader/global-loader.service';
import { SectionService } from './service/section/section.service';
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
    NavbarComponent, SidebarComponent, FooterComponent, ToastComponent,
    GlobalLoaderComponent, CommonModule, AddExpenseComponent,
    SettingsComponent, ListExpensesComponent, HomeComponent, BudgetComponent, CalendarComponent, AiComponent, MusicComponent, InstallAppPopupComponentComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  /**
   * Currently active section of the app (e.g., 'home', 'settings').
   */
  currentSection: string = 'home';

  /**
   * Boolean indicating whether the app is being viewed on a mobile device.
   */
  isMobile: boolean = false;

  /**
   * Boolean indicating whether the current route is the root/expenses page.
   */
  isExpenseRoute = false;

  /**
   * Boolean indicating whether the current route is the music page.
   */
  isMusicRoute = false;

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
   * @param sectionService Service to track current section changes
   * @param storageService Local storage schema sync service
   * @param router Angular Router to track route changes
   * @param postApiService Backend API post service
   * @param swUpdate Service Worker update manager
   * @param platformId Angular platform ID to check if running in browser
   * @param toastService Service for displaying toast notifications
   */
  constructor(
    public userService: UserService,
    private loader: GlobalLoaderService,
    private sectionService: SectionService,
    private storageService: StorageService,
    private router: Router,
    private postApiService: PostApiService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    // Track current section name
    this.sectionService.currentSection$.subscribe(section => {
      this.currentSection = section;
    });

    // Track route changes to detect page-specific routes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.isExpenseRoute = url === '/';
        this.isMusicRoute = url.startsWith('/music');
      });
  }

  /**
   * Angular lifecycle hook called after component initialization.
   * Applies theme, syncs schema, sets user ID, and shows loader.
   */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;

      this.loader.show();
      setTimeout(() => {
        this.loader.hide();
      }, 500);

      // Sync schema for stored data
      this.storageService.syncCategoriesWithSchema();
      this.storageService.syncExpensesWithSchema();
      this.storageService.syncUserWithSchema();
      this.storageService.syncBudgetWithSchema();
      this.storageService.syncLikedSongsWithSchema();

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
   * Event listener for window resize to update mobile view detection.
   * @param event Resize event object
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = event.target.innerWidth <= 768;
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
