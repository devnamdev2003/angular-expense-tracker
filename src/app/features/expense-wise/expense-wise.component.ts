import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ToastComponent } from '../../shared/toast/toast.component';
import { AddExpenseComponent } from '../../features/add-expense/add-expense.component';
import { SettingsComponent } from '../../features/settings/settings.component';
import { ListExpensesComponent } from '../../features/list-expenses/list-expenses.component';
import { HomeComponent } from '../../features/home/home.component';
import { CalendarComponent } from '../../features/calendar/calendar.component';
import { BudgetComponent } from '../../features/budget/budget.component';
import { AiComponent } from '../../features/ai/ai.component';

import { SectionService } from '../../service/section/section.service';

/**
 * Root component of the application.
 * Manages global state, mobile view detection, section tracking,
 * theme application, schema syncing, and PWA update activation.
 */
@Component({
  selector: 'app-expense-wise',
  standalone: true,
  imports: [
    NavbarComponent, SidebarComponent, FooterComponent, ToastComponent, CommonModule, AddExpenseComponent,
    SettingsComponent, ListExpensesComponent, HomeComponent, BudgetComponent, CalendarComponent, AiComponent
  ],
  templateUrl: './expense-wise.component.html',
  styleUrl: './expense-wise.component.css'
})
export class ExpenseWiseComponent {

  /**
   * Currently active section of the app (e.g., 'home', 'settings').
   */
  currentSection: string = 'home';

  /**
   * Boolean indicating whether the app is being viewed on a mobile device.
   */
  isMobile: boolean = false;
  /**
   * Constructor for AppComponent.
   * Initializes route tracking, section updates, PWA update listener, and services.
   * 
   * @param sectionService Service to track current section changes
   * @param platformId Angular platform ID to check if running in browser
   */
  constructor(
    private sectionService: SectionService,
    @Inject(PLATFORM_ID) private platformId: Object

  ) {
    // Track current section name
    this.sectionService.currentSection$.subscribe(section => {
      this.currentSection = section;
    });
  }
  /**
   * OnInit lifecycle hook to set initial mobile view detection.
   */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
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
}