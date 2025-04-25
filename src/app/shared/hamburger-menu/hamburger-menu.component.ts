import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-hamburger-menu',
  imports: [CommonModule],
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.css'], // Corrected to 'styleUrls'
})
export class HamburgerMenuComponent {
  constructor(private router: Router
  ) { }
  isMenuOpen = false;

  // Toggle the menu when the button is clicked
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Close the menu if clicked outside
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedInside = event.target instanceof HTMLElement && event.target.closest('.hamburger-menu-container');
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }

  navigateAndClose(path: string, event: Event) {
    event.preventDefault();
    this.router.navigate([path]);
    this.isMenuOpen = !this.isMenuOpen;
  }

}
