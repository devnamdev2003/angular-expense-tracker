import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalLoaderService } from '../../service/global-loader/global-loader.service';

@Component({
  selector: 'app-search-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-button.component.html',
  styleUrls: ['./search-button.component.css']
})

export class SearchButtonComponent {

  isOpen = false;
  query = '';

  constructor(
    private globalLoader: GlobalLoaderService
  ) { }

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @Output() search = new EventEmitter<string>();

  toggleSearch() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 50);
    }
  }

  onSearch() {
    console.log('Child emitting search query:', this.query);
    this.search.emit(this.query);
    this.searchInput?.nativeElement.blur();
    this.globalLoader.show('Searching...');
    setTimeout(() => {
      this.globalLoader.hide();
    }, 500);
  }

  onInputChange() {
    if (this.query.trim().length > 10) {
      this.query = this.query.slice(0, 10);
    }
  }
}
