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
  currentDate: Date = new Date();  // ✅ Add this

  setViewType(view: 'month' | 'day') {
    this.viewType = view;
    this.currentDate = new Date(); // Reset date to today/month
  }

  goPrevious() {
    if (this.viewType === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.viewType === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.currentDate = new Date(this.currentDate); // Force change detection
  }

  goNext() {
    if (this.viewType === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.viewType === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.currentDate = new Date(this.currentDate); // Force change detection
  }

  getDisplayDate(): string {
    if (this.viewType === 'day') {
      return this.currentDate.toDateString(); // example: "Sun Apr 27 2025"
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
  }
}
