import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../service/localStorage/category.service';

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-dropdown.component.html',
  styleUrls: ['./category-dropdown.component.css']
})
export class CategoryDropdownComponent {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryName: string = 'Select Category';
  @Output() categorySelected = new EventEmitter<Category>();

  isDropdownOpen = false;
  hoveredCat: Category | null = null;


  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectCategory(category: Category) {
    this.categorySelected.emit(category);
    this.selectedCategoryName = category.name;
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isDropdownOpen && this.dropdownRef && !this.dropdownRef.nativeElement.contains(target)) {
      this.isDropdownOpen = false;
    }
  }
}
