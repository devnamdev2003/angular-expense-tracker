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
import { Category, CategoryService } from '../../service/localStorage/category.service';

/**
 * Dropdown component for selecting an expense category.
 * Emits selected category to the parent component.
 */
@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-dropdown.component.html',
  styleUrls: ['./category-dropdown.component.css']
})
export class CategoryDropdownComponent {
  /**
   * Emits the selected category to parent
   */
  @Output() categorySelected = new EventEmitter<Category>();

  /**
   * Name of the currently selected category (display only)
   */
  @Input() selectedCategoryName: string = 'Select Category';

  /**
   * Optional max-height Tailwind class for scrollable dropdown
   */
  @Input() dropdownMaxHeightClass: string = 'max-h-40';

  /** List of categories to display */
  categories: Category[] = [];

  /** Dropdown visibility state */
  isCategoryDropdownOpen: boolean = false;

  /** Reference to the dropdown DOM element */
  @ViewChild('categorydownRef') categoryRef!: ElementRef;

  constructor(private categoryService: CategoryService) {}

  /** Initializes and loads categories */
  ngOnInit(): void {
    this.loadCategories();
  }

  /** Loads sorted categories from service */
  loadCategories(): void {
    this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
  }

  /** Toggles category dropdown visibility */
  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  /**
   * Handles category selection from the list
   * @param category The selected category
   */
  selectCategory(category: Category): void {
    this.categorySelected.emit(category);
    this.selectedCategoryName = category.name;
    this.isCategoryDropdownOpen = false;
  }

  /**
   * Listens to clicks outside dropdown to close it
   * @param event Click event
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      this.isCategoryDropdownOpen &&
      this.categoryRef &&
      !this.categoryRef.nativeElement.contains(target)
    ) {
      this.isCategoryDropdownOpen = false;
    }
  }
}
