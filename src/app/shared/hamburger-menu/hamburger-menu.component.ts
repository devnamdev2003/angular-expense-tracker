import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionService } from '../../service/section/section.service';

/**
 * Hamburger menu component for mobile or compact navigation.
 *
 * Features:
 * - Toggles visibility of the menu.
 * - Closes menu when clicking outside of it.
 * - Shows/hides AI button depending on the current section.
 * - Integrates with {@link SectionService} to navigate between sections.
 */
@Component({
  selector: 'app-hamburger-menu',
  imports: [CommonModule],
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.css'],
})
export class HamburgerMenuComponent {

  /**
   * Determines whether the AI button should be displayed.
   * Hidden when the current section is 'ai'.
   */
  showAIButton = false;

  /**
   * Tracks whether the hamburger menu is currently open.
   */
  isMenuOpen = false;

  /**
   * Creates an instance of HamburgerMenuComponent.
   *
   * Subscribes to {@link SectionService.currentSection$} to manage the
   * visibility of the AI button based on the current section.
   *
   * @param sectionService Service for managing and broadcasting the active section.
   */
  constructor(private sectionService: SectionService) {
    this.sectionService.currentSection$.subscribe(section => {
      this.showAIButton = section !== 'ai';
    });
  }

  /**
   * Toggles the hamburger menu open/closed state.
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Listens for clicks on the document to close the menu
   * if the click occurs outside the hamburger menu container.
   *
   * @param event The mouse click event.
   */
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const clickedInside = event.target instanceof HTMLElement 
      && event.target.closest('.hamburger-menu-container');
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }

  /**
   * Navigates to the selected section and closes the menu.
   *
   * @param section The section identifier to navigate to.
   * @param event The click event object (used to prevent default anchor behavior).
   */
  navigateAndClose(section: string, event: Event): void {
    event.preventDefault();
    this.sectionService.setSection(section);
    this.isMenuOpen = !this.isMenuOpen;
  }
}
