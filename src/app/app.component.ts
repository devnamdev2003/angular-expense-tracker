// import { Component, ViewChild } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { DialogComponent } from './shared/dialog/dialog.component';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet, DialogComponent],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'ExpenseWise';
//   @ViewChild('restoreDialog') restoreDialog!: DialogComponent;
//   validateAndRestore(event: Event) {
//     event.preventDefault();

//     const email = (document.getElementById('restoreEmail') as HTMLInputElement).value;
//     const password = (document.getElementById('restorePassword') as HTMLInputElement).value;
//     console.log('Restore with', email, password);
//   }
// }

import { Component } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {}
