import { Component, HostListener } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { StorageService } from './service/localStorage/storage.service';
import { UserService } from './service/localStorage/user.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { ToastComponent } from './shared/toast/toast.component'
import { GlobalLoaderComponent } from './shared/global-loader/global-loader.component'
import { GlobalLoaderService } from './service/global-loader/global-loader.service';
import { AddExpenseComponent } from './features/add-expense/add-expense.component';
import { SearchComponent } from './features/search/search.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ListExpensesComponent } from './features/list-expenses/list-expenses.component';
import { HomeComponent } from './features/home/home.component';
import { CalendarComponent } from './features/calendar/calendar.component';
import { SectionService } from './service/section/section.service';
import { BudgetComponent } from './features/budget/budget.component';
import { AnalysisComponent } from './features/analysis/analysis.component';
import { AiComponent } from './features/ai/ai.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MusicComponent } from './features/music/music.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FooterComponent, ToastComponent, GlobalLoaderComponent, CommonModule, AddExpenseComponent,
    SearchComponent,
    SettingsComponent,
    ListExpensesComponent,
    HomeComponent,
    BudgetComponent,
    AnalysisComponent,
    CalendarComponent,
    AiComponent,
    MusicComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  currentSection: string = 'home';
  isMobile: boolean = false;
  isExpenseRoute = false;
  isMusicRoute = false;

  constructor(
    public userService: UserService,
    private loader: GlobalLoaderService,
    private sectionService: SectionService,
    private storageService: StorageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.sectionService.currentSection$.subscribe(section => {
      this.currentSection = section;
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.isExpenseRoute = url === '/';
        this.isMusicRoute = url.startsWith('/music');
      });

  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;

      this.loader.show();
      setTimeout(() => {
        this.loader.hide();
      }, 500);

      this.storageService.syncCategoriesWithSchema();
      this.storageService.syncExpensesWithSchema();
      this.storageService.syncUserWithSchema();
      this.storageService.syncBudgetWithSchema();

      const savedTheme = this.userService.getValue<string>('theme_mode');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      let userId = this.userService.getValue<string>('id');
      if (!userId) {
        userId = this.generateUserId();
        this.userService.update('id', userId);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = event.target.innerWidth <= 768;
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  private generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }
}
