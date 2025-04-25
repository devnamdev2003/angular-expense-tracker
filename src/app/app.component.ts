import { Component, HostListener } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { StorageService } from './localStorage/storage.service';
import { UserService } from './localStorage/user.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(
    public userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      StorageService.syncCategoriesWithSchema();
      StorageService.syncExpensesWithSchema();
      StorageService.syncUserWithSchema();
      StorageService.syncBudgetWithSchema();

      const savedTheme = this.userService.getValue<string>('theme_mode');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  // // Prevent right-click (context menu) globally
  // @HostListener('document:contextmenu', ['$event'])
  // onRightClick(event: MouseEvent) {
  //   event.preventDefault();
  // }
}
