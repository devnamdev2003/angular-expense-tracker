import { Component } from '@angular/core';
import { GraphsComponent } from '../../component/graphs/graphs.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from '../../component/pie-chart/pie-chart.component';
import { SectionService } from '../../service/section/section.service';
import { UserService } from '../../service/localStorage/user.service';

/**
 * HomeComponent is the main dashboard that displays graphs and charts
 * based on the user's selected time view: day, month, or year.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GraphsComponent, FormsModule, CommonModule, PieChartComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  /**
   * The default view type to be loaded on component init.
   */
  defaultViewType: 'month' | 'day' | 'year' = 'month';

  /**
   * Current active view type ('month', 'day', or 'year').
   */
  viewType: 'month' | 'day' | 'year' = this.defaultViewType;

  /**
   * Flag to toggle visibility of day-specific input section.
   */
  viewTypeDayDiv: boolean = false;

  /**
   * Flag to toggle visibility of year-specific input section.
   */
  viewTypeYearDiv: boolean = false;

  /**
   * Current selected date to show data for.
   */
  currentDate: Date = new Date();

  /**
   * Boolean to force resetting of input fields.
   */
  forceInputReset: boolean = false;

  /** Flag to determine if the user can access ai ssection for analysis data*/
  has_ai_access: boolean = false;

  /**
   * Creates an instance of the HomeComponent.
   *
   * @param sectionService the currently active application section.
   * @param userService user-specific data stored in local storage.
   */
  constructor(
    private sectionService: SectionService,
    private userService: UserService
  ) {
    this.has_ai_access = this.userService.getValue<boolean>('has_ai_access') ?? false;
  }

  /**
   * Sets the active view type and resets state flags accordingly.
   * @param view The view type to switch to
   */
  setViewType(view: 'month' | 'day' | 'year') {
    if (this.viewType != view) {
      this.defaultViewType = view;
      this.viewType = view;
      this.currentDate = new Date();
      this.viewTypeDayDiv = false;
      this.viewTypeYearDiv = false;

      if (this.viewType === 'day') {
        this.viewTypeDayDiv = true;
      }

      if (this.viewType === 'year') {
        this.viewTypeYearDiv = true;
      }
    }
  }

  /**
   * Navigates to the previous day, month, or year depending on current view.
   */
  goPrevious() {
    if (this.viewType === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.viewType === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (this.viewType === 'year') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
    }
    this.currentDate = new Date(this.currentDate);
  }

  /**
   * Navigates to the next day, month, or year depending on current view.
   */
  goNext() {
    if (this.viewType === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.viewType === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (this.viewType === 'year') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
    }
    this.currentDate = new Date(this.currentDate);
  }

  /**
   * Returns the formatted string to display based on selected view type.
   * @returns Formatted date string for display
   */
  getDisplayDate(): string {
    if (this.viewType === 'day') {
      return this.currentDate.toDateString();
    } else if (this.viewType === 'month') {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    } else {
      return `${this.currentDate.getFullYear()}`;
    }
  }

  /**
   * Handles input change for day-type date picker.
   * @param event Input event
   * @param inputRef Reference to the input element
   */
  onInputChange(event: any, inputRef: HTMLInputElement) {
    const value = event.target.value;
    if (!value || value.trim() === '') {
      inputRef.value = this.formatDateForInput(this.currentDate);
      return;
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      this.currentDate = parsed;
    } else {
      inputRef.value = this.formatDateForInput(this.currentDate);
    }
  }

  /**
   * Handles input change for month-type input.
   * @param event Input event
   * @param inputRef Reference to the input element
   */
  onMonthChange(event: any, inputRef: HTMLInputElement) {
    const value = event.target.value;
    if (!value || value.trim() === '') {
      inputRef.value = this.formatMonthForInput(this.currentDate);
      return;
    }

    const [year, month] = value.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month)) {
      this.currentDate = new Date(year, month - 1);
    } else {
      inputRef.value = this.formatMonthForInput(this.currentDate);
    }
  }

  /**
   * Formats a Date object to `YYYY-MM-DD` for input[type=date].
   * @param date Date object to format
   * @returns Formatted string
   */
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Formats a Date object to `YYYY-MM` for input[type=month].
   * @param date Date object to format
   * @returns Formatted string
   */
  formatMonthForInput(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Prevents the user from using backspace/delete keys in certain inputs.
   * @param event Keyboard event
   */
  blockKey(event: KeyboardEvent) {
    if (['Backspace', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Handles button link clicks by updating the current application section
   * and preventing the default anchor navigation behavior.
   *
   *
   * @param section to activate. Examples: `'home'`, `'settings'`, `'ai'`.
   * @param event The DOM click event used to prevent the default
   * @returns void
   */
  navigateAndClose(section: string, event: Event): void {
    event.preventDefault();
    this.sectionService.setSection(section);
  }

}