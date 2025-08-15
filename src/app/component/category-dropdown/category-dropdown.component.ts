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
import { UserService } from '../../service/localStorage/user.service';

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
   * @type {EventEmitter<Category>}
   */
  @Output() categorySelected = new EventEmitter<Category>();

  /**
   * Name of the currently selected category (display only)
   * @type {string}
   */
  @Input() selectedCategoryName: string = 'Select Category';

  /**
   * Optional max-height Tailwind class for scrollable dropdown
   * @type {string}
   * Default is 'max-h-40' (10rem)
   */
  @Input() dropdownMaxHeightClass: string = 'max-h-40';

  /**
   * Optional categoryType to filter categories
   * @type {'default' | 'custom' | 'all'}
   * - 'default': only default categories
   * - 'custom': only custom categories
   * - 'all': all categories (default)
   */
  @Input() categoryType: 'default' | 'custom' | 'all' = 'all';

  /** List of categories to display */
  categories: Category[] = [];

  /** Dropdown visibility state */
  isCategoryDropdownOpen: boolean = false;

  /** Reference to the dropdown DOM element */
  @ViewChild('categorydownRef') categoryRef!: ElementRef;

  /**
   * Constructor to inject services
   * @param categoryService Service to manage categories
   * @param userService Service to manage user data
   */
  constructor(private categoryService: CategoryService, private userService: UserService) { }

  /** 
   * Initializes and loads categories
   */
  ngOnInit(): void {
    this.loadCategories();
  }

  /** Loads sorted categories from service */
  loadCategories(): void {
    this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
    if (this.categoryType !== 'all') {
      if (this.categoryType === 'custom') {
        let userId = this.userService.getValue<string>('id') || '0';
        this.categories = this.categories.filter(category =>
          category.user_id === userId
        );
      }
      else {
        this.categories = this.categories.filter(category =>
          category.user_id === '0'
        );
      }
    }
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
