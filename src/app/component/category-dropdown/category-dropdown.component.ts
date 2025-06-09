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

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-dropdown.component.html',
  styleUrls: ['./category-dropdown.component.css']
})
export class CategoryDropdownComponent {

  @Output() categorySelected = new EventEmitter<Category>();
  @Input() selectedCategoryName: string = 'Select Category';
  @Input() dropdownMaxHeightClass: string = 'max-h-40'; 

  categories: Category[] = [];
  isCategoryDropdownOpen: boolean = false;
  @ViewChild('categorydownRef') categoryRef!: ElementRef;

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    this.loadCategories();
  }
  loadCategories() {
    this.categories = this.categoryService.getSortedCategoriesByExpenseCount();
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(category: Category) {
    this.categorySelected.emit(category);
    this.selectedCategoryName = category.name;
    this.isCategoryDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
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
