import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SectionService } from '../../service/section/section.service';

/**
 * Sidebar navigation component.
 *
 * This component:
 * - Displays sidebar links for navigating between different application sections.
 * - Highlights the currently active section.
 * - Communicates with {@link SectionService} to update and listen to the current active section.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  /**
   * Holds the name of the currently active navigation path/section.
   * Used to apply active styling to the sidebar item.
   */
  activePath: string = '';

  /**
   * Creates an instance of SidebarComponent.
   *
   * Subscribes to {@link SectionService.currentSection$} to keep track of
   * the currently selected section and update the UI accordingly.
   *
   * @param sectionService Service for managing and broadcasting the active section state.
   */
  constructor(private sectionService: SectionService) {
    this.sectionService.currentSection$.subscribe(section => {
      this.activePath = section;
    });
  }

  /**
   * Handles sidebar link clicks by updating the current section
   * and preventing the default anchor navigation behavior.
   *
   * @param section The section identifier to navigate to.
   * @param event The click event object (used to prevent default navigation).
   */
  navigateAndClose(section: string, event: Event): void {
    event.preventDefault();
    this.sectionService.setSection(section);
  }
}
