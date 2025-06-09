import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionService } from '../../service/section/section.service';

@Component({
  selector: 'app-hamburger-menu',
  imports: [CommonModule],
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.css'],
})
export class HamburgerMenuComponent {

  showAIButton = false;
  constructor(private sectionService: SectionService) {
    this.sectionService.currentSection$.subscribe(section => {
      this.showAIButton = section !== 'ai';
    });
  }
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

  navigateAndClose(section: string, event: Event) {
    event.preventDefault();
    this.sectionService.setSection(section);
    this.isMenuOpen = !this.isMenuOpen;
  }

}
