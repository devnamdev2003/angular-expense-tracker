import { Component } from '@angular/core';
import { GraphsComponent } from '../../component/graphs/graphs.component';

@Component({
  selector: 'app-home',
  imports: [GraphsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {
  viewType: 'month' | 'day' = 'month';

  // When button clicked
  setViewType(view: 'month' | 'day') {
    this.viewType = view;
  }
}
