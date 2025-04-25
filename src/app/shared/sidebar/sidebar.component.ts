import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private router: Router
  ) { }

  navigateAndClose(path: string, event: Event) {
    event.preventDefault();
    this.router.navigate([path]);
  }

}


