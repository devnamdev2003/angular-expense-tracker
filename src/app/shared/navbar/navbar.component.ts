import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionService } from '../../service/section/section.service';
import { HamburgerMenuComponent } from '../hamburger-menu/hamburger-menu.component';

/**
 * Navbar component that displays the top navigation bar.
 *
 * Features:
 * - Shows a back button when the current section is not 'home'.
 * - Integrates with {@link SectionService} to track and update the current section.
 * - Includes the {@link HamburgerMenuComponent} for mobile or compact navigation.
 */
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, HamburgerMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  /**
   * Flag indicating whether the back button should be displayed.
   * True when the current section is not 'home'.
   */
  showBackButton = false;

  /**
   * The label text currently displayed in the navigation bar.
   */
  navBarLable: string = 'Expense Tracker';

  /**
   * Mapping of section identifiers to their corresponding display labels.
   */
  private sectionLabels: Record<string, string> = {
    home: 'Expense Tracker',
    settings: 'Settings',
    expenses: 'Expenses',
    ai: 'AI Analysis',
    budget: 'Budget',
    calendar: 'Calender',
    list: 'List',
    add: 'Add Expense'
  };

  /**
   * Creates an instance of NavbarComponent.
   *
   * Subscribes to {@link SectionService.currentSection$} to:
   * - Toggle the back button visibility (hidden on 'home', visible otherwise).
   * - Dynamically update the {@link navBarLable} based on the active section
   *   using the {@link sectionLabels} map for display text.
   *
   * @param sectionService Service used to manage and broadcast the active section state.
   */
  constructor(private sectionService: SectionService) {
    this.sectionService.currentSection$.subscribe(section => {
      this.showBackButton = section !== 'home';
      this.navBarLable = this.sectionLabels[section];
    });
  }

  /**
   * Handles navigation link clicks by updating the current section
   * and preventing default anchor navigation behavior.
   *
   * @param section The section identifier to navigate to.
   * @param event The click event object (used to prevent default behavior).
   */
  navigateAndClose(section: string, event: Event): void {
    event.preventDefault();
    this.sectionService.setSection(section);
  }
}
