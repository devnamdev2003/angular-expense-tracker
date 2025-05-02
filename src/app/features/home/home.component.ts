import { Component } from '@angular/core';
import { GraphsComponent } from '../../component/graphs/graphs.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [GraphsComponent, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true
})

export class HomeComponent {
  viewType: 'month' | 'day' = 'month';
  currentDate: Date = new Date();
  forceInputReset: boolean = false;

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


  // Helper: Format Month as yyyy-MM
  onInputChange(event: any, inputRef: HTMLInputElement) {
    const value = event.target.value;
    if (!value || value.trim() === '') {
      inputRef.value = this.formatDateForInput(this.currentDate); // reset value
      return;
    }
  
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      this.currentDate = parsed;
    } else {
      inputRef.value = this.formatDateForInput(this.currentDate); // fallback
    }
  }
  
  onMonthChange(event: any, inputRef: HTMLInputElement) {
    const value = event.target.value;
    if (!value || value.trim() === '') {
      inputRef.value = this.formatMonthForInput(this.currentDate); // reset value
      return;
    }
  
    const [year, month] = value.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month)) {
      this.currentDate = new Date(year, month - 1);
    } else {
      inputRef.value = this.formatMonthForInput(this.currentDate); // fallback
    }
  }
  
  // helpers
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  }
  
  formatMonthForInput(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // yyyy-MM
  }
  

  jumpToDate() {
    this.currentDate = new Date(this.currentDate);
    // Disable editing after the change
  }

  blockKey(event: KeyboardEvent) {
    // Allow tab, arrows, etc., block delete/backspace
    if (['Backspace', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

}
