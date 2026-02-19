import { Component, OnInit, AfterViewChecked, ChangeDetectionStrategy, signal, computed, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HelpData } from '../../service/localStorage/data/help-data';

// External icon library global declaration (Lucide icons)
declare var lucide: any;

/**
 * FAQ Interface
 * Defines the structure of FAQ objects used in Help Dashboard.
 */
interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}


/**
 * Help Dashboard Component
 *
 * Responsibilities:
 * - Display FAQ list with search and category filtering
 * - Accordion-style question expansion
 * - Highlight search results dynamically
 * - Contact form submission with validation
 * - Icon rendering using Lucide library
 *
 * Performance Optimization:
 * - Uses OnPush change detection
 * - Uses Angular Signals for reactive state
 */
@Component({
  selector: 'app-help-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-dashboard.html',
  styleUrl: './help-dashboard.css'
})
export class HelpDashboard implements OnInit, AfterViewChecked {

  // Dependency injection using Angular inject() function
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  // FAQ static data source
  private readonly helpData: FAQ[] = HelpData;

  /* ------------------------------------------------------------------
     SIGNAL STATES (Reactive state management)
     ------------------------------------------------------------------ */

  // Stores user search query
  searchQuery = signal<string>('');

  // Stores currently opened accordion IDs
  openAccordions = signal<Set<number>>(new Set());

  // Form UI state signals
  isSubmitting = signal<boolean>(false);
  submitSuccess = signal<boolean>(false);
  submitError = signal<boolean>(false);

  // Tracks fields needing shake animation on validation error
  shakeFields = signal<Set<string>>(new Set());


  /* ------------------------------------------------------------------
     CONTACT FORM SETUP
     ------------------------------------------------------------------ */

  // Reactive form configuration with validation rules
  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    query: ['', [Validators.required, Validators.minLength(10)]]
  });


  /* ------------------------------------------------------------------
     COMPUTED SIGNALS (Derived UI State)
     ------------------------------------------------------------------ */

  /**
   * Filters FAQs based on search query.
   * Matches question, answer, or category text.
   */
  filteredFAQs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.helpData;

    return this.helpData.filter(item =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });


  /**
   * Groups filtered FAQs by category.
   * Useful for categorized display in UI.
   */
  groupedFAQs = computed(() => {
    const items = this.filteredFAQs();
    const categories = [...new Set(items.map(i => i.category))];

    return categories.map(cat => ({
      category: cat,
      items: items.filter(i => i.category === cat)
    }));
  });


  /* ------------------------------------------------------------------
     LIFECYCLE HOOKS
     ------------------------------------------------------------------ */

  /**
   * OnInit lifecycle hook.
   * Injects fonts and icon libraries.
   */
  ngOnInit() {
    this.injectFontAwesome();
  }


  /**
   * AfterViewChecked lifecycle hook.
   * Ensures icons are re-rendered after DOM updates.
   */
  ngAfterViewChecked() {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }


  /* ------------------------------------------------------------------
     EXTERNAL SCRIPT & FONT INJECTION
     ------------------------------------------------------------------ */

  /**
   * Dynamically injects:
   * - Lucide icon script
   * - Google font (Outfit)
   *
   * Only runs in browser environment.
   */
  injectFontAwesome() {
    // Only run in browser (prevents SSR error)
    if (!isPlatformBrowser(this.platformId)) return;

    // Inject Lucide icon script
    if (!document.getElementById('lucide-script')) {
      const script = document.createElement('script');
      script.id = 'lucide-script';
      script.src = 'https://unpkg.com/lucide@latest';

      script.onload = () => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
      };

      document.body.appendChild(script);
    }

    // Inject Google font safely
    if (!document.getElementById('outfit-font')) {
      const font = document.createElement('link');
      font.id = 'outfit-font';
      font.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap";
      font.rel = "stylesheet";

      document.head.appendChild(font);
    }
  }



  /* ------------------------------------------------------------------
     SEARCH & FILTER LOGIC
     ------------------------------------------------------------------ */

  /**
   * Updates search query signal when user types.
   */
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  /**
   * Clears search input.
   */
  resetSearch() {
    this.searchQuery.set('');
  }

  /**
   * Sets category filter and scrolls FAQ container into view.
   */
  setCategory(category: string) {
    this.searchQuery.set(category);

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        document.getElementById('faqContainer')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }


  /* ------------------------------------------------------------------
     ACCORDION CONTROL
     ------------------------------------------------------------------ */

  /**
   * Toggle FAQ accordion open/close.
   */
  toggleAccordion(id: number) {
    const current = new Set(this.openAccordions());

    if (current.has(id)) current.delete(id);
    else current.add(id);

    this.openAccordions.set(current);
  }

  /**
   * Checks if accordion is open.
   */
  isAccordionOpen(id: number): boolean {
    return this.openAccordions().has(id);
  }


  /* ------------------------------------------------------------------
     SEARCH TEXT HIGHLIGHTING
     ------------------------------------------------------------------ */

  /**
   * Highlights matched search text in FAQs.
   * Uses sanitizer to safely inject HTML.
   */
  highlightText(text: string, query: string): SafeHtml {
    if (!query)
      return this.sanitizer.bypassSecurityTrustHtml(text);

    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');

    const replaced = text.replace(
      regex,
      '<span class="bg-amber-200/50 text-slate-900 px-0.5 rounded shadow-sm font-medium">$1</span>'
    );

    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }


  /* ------------------------------------------------------------------
     FORM UX HELPERS
     ------------------------------------------------------------------ */

  /**
   * Scrolls page to contact form section.
   */
  scrollToForm() {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('contactFormSection')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Checks if form control is invalid.
   */
  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /**
   * Determines if field should show shake animation.
   */
  shouldShake(controlName: string): boolean {
    return this.shakeFields().has(controlName);
  }


  /* ------------------------------------------------------------------
     FORM SUBMISSION LOGIC
     ------------------------------------------------------------------ */

  /**
   * Handles contact form submission.
   * - Validates form
   * - Shows animation for invalid fields
   * - Sends POST request to backend API
   * - Displays success/error state
   */
  async onSubmit() {
    this.submitSuccess.set(false);
    this.submitError.set(false);

    // Validation handling
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();

      const invalidFields = new Set<string>();
      Object.keys(this.contactForm.controls).forEach(key => {
        if (this.contactForm.get(key)?.invalid)
          invalidFields.add(key);
      });

      this.shakeFields.set(invalidFields);

      // Remove shake animation after 500ms
      setTimeout(() => this.shakeFields.set(new Set()), 500);
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      message: this.contactForm.value.query
    };

    try {
      // API submission
      const response = await fetch(
        'https://coders813-exwiseapi.hf.space/api/contact/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        this.submitSuccess.set(true);
        this.contactForm.reset();
      } else {
        throw new Error('Server error');
      }

    } catch (error) {
      console.error("Submission Error:", error);
      this.submitError.set(true);

    } finally {
      this.isSubmitting.set(false);

      // Required for OnPush detection
      this.cdr.markForCheck();

      // Re-render icons if new DOM elements added
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          if (typeof lucide !== 'undefined')
            lucide.createIcons();
        });
      }
    }
  }
}
