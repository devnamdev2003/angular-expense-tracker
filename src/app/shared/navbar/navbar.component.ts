import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service'; // adjust path

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  constructor(private sidebarService: SidebarService) {}

  toggleSidebar() {
    const isCurrentlyOpen = this.sidebarService.getSidebarOpen();
    const newState = !isCurrentlyOpen;
    this.sidebarService.setSidebarOpen(newState);

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('hidden', !newState);
      document.body.dataset['sidebarOpen'] = newState.toString();
    }
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = event.target as HTMLElement;
    const isCurrentlyOpen = this.sidebarService.getSidebarOpen();
    if (
      isCurrentlyOpen &&
      sidebar &&
      !sidebar.contains(toggleButton) &&
      !toggleButton.closest('button')
    ) {
      this.toggleSidebar();
    }
  }
}