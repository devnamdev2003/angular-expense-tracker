import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HamburgerMenuComponent } from '../hamburger-menu/hamburger-menu.component';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, HamburgerMenuComponent, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  showBackButton = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Show back button if not on /home
        this.showBackButton = event.urlAfterRedirects !== '/home';
      }
    });
  }

  navigateAndClose(path: string, event: Event) {
    event.preventDefault();
    this.router.navigate([path]);
  }
  
}
