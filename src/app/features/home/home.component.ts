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
  currentDate: Date = new Date();

  setViewType(view: 'month' | 'day') {
    this.viewType = view;
    this.currentDate = new Date();
  }

  goPrevious() {
    if (this.viewType === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.viewType === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.currentDate = new Date(this.currentDate);
  }

  goNext() {
    if (this.viewType === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.viewType === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.currentDate = new Date(this.currentDate);
  }

  getDisplayDate(): string {
    if (this.viewType === 'day') {
      return this.currentDate.toDateString();
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
  }
}
