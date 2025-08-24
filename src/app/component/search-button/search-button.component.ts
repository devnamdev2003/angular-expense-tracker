import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalLoaderService } from '../../service/global-loader/global-loader.service';

/**
 * SearchButtonComponent
 *
 * A floating action button that expands into a search input field.
 * Emits the search query to the parent component and shows a global loader while processing.
 */
@Component({
  selector: 'app-search-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-button.component.html',
  styleUrls: ['./search-button.component.css']
})
export class SearchButtonComponent {

  /**
   * Tracks whether the search input is open or closed.
   * Defaults to `false`.
   */
  isOpen = false;

  /**
   * Stores the current search query entered by the user.
   */
  query = '';

  /**
   * Reference to the search input field in the template.
   */
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  /**
   * Emits the current search query to the parent component.
   */
  @Output() search = new EventEmitter<string>();

  /**
   * Creates an instance of SearchButtonComponent.
   * @param globalLoader Service to control the global loading indicator
   */
  constructor(
    private globalLoader: GlobalLoaderService
  ) { }

  /**
   * Toggles the visibility of the search input field.
   * If opened, it automatically focuses the input field after a short delay.
   */
  toggleSearch(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 50);
    }
  }

  /**
   * Handles the search action when user presses Enter.
   * - Emits the query to the parent.
   * - Removes focus from the input.
   * - Displays the global loader for a short duration.
   */
  onSearch(): void {
    console.log('Child emitting search query:', this.query);
    this.search.emit(this.query);
    this.searchInput?.nativeElement.blur();
    this.globalLoader.show('Searching...');
    setTimeout(() => {
      this.globalLoader.hide();
    }, 500);
  }

  /**
   * Triggers whenever the search input value changes.
   * Restricts the query length to a maximum of 10 characters.
   */
  onInputChange(): void {
    if (this.query.trim().length > 10) {
      this.query = this.query.slice(0, 10);
    }
  }
}
