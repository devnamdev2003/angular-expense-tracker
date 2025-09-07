import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * ExpenseListComponent
 *
 * Displays a list of expenses with formatted dates and emits
 * events when an expense is selected. Also provides a utility
 * to darken colors for styling purposes.
 */
@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent {
  /**
   * The list of expense objects to display.
   * Each expense should contain at least a `date` field.
   */
  @Input() expenses: any[] = [];

  /**
   * The currency symbol or code to display with expense amounts.
   */
  @Input() currency: string | null;

  /**
   * Event emitted when an expense is selected.
   */
  @Output() expenseSelected = new EventEmitter<any>();

  /**
   * Creates an instance of ExpenseListComponent.
   * Initializes the currency to an empty string.
   */
  constructor() {
    this.currency = '';
  }

  /**
   * Handles the selection of an expense.
   * Emits the selected expense via the `expenseSelected` output.
   *
   * @param expense The expense object that was selected.
   */
  onSelect(expense: any): void {
    this.expenseSelected.emit(expense);
  }

  /**
   * Formats the date of an expense into a human-readable string.
   * Example: `Mon 1st Mar 2025`
   *
   * @param exp The expense object containing a `date` field.
   * @returns A formatted date string with day, suffix, month, and year.
   */
  getFormattedDate(exp: any): string {
    const date = new Date(exp.date);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const suffix = (d: number): string => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    return `${dayName} ${day}${suffix(day)} ${month} ${year}`;
  }

  /**
   * Darkens a given HEX color by a percentage.
   * Converts the color to RGB and decreases brightness.
   *
   * @param color The HEX color string (e.g., `#FF0000`).
   * @param percent The percentage (0–1) to darken the color.
   * @returns The darkened color as an RGB string, or the original color on error.
   */
  darkenColor(color: string, percent: number): string {
    try {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent * 100);
      const R = (num >> 16) - amt;
      const G = ((num >> 8) & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;

      return `rgb(${Math.max(R, 0)}, ${Math.max(G, 0)}, ${Math.max(B, 0)})`;
    } catch {
      return color;
    }
  }
}
