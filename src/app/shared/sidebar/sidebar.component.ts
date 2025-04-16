import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service'; // adjust path

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @ViewChild('sidebarRef', { static: true }) sidebarRef!: ElementRef;

  constructor(private router: Router,
    private sidebarService: SidebarService
  ) { }

  navigateAndClose(path: string, event: Event) {
    event.preventDefault(); // prevent default anchor behavior
    this.closeSidebarIfMobile();
    this.router.navigate([path]);
  }


  closeSidebarIfMobile() {
    if (window.innerWidth < 768) {
      this.sidebarRef.nativeElement.classList.add('hidden');
      const menuToggle = document.getElementById('menuToggle');
      if (menuToggle) {
        menuToggle.classList.remove('hidden');
      }
      // Sync with navbar
      this.sidebarService.setSidebarOpen(false);
    }
  }
}


