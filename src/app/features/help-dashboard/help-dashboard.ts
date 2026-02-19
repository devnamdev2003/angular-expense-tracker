import { Component, OnInit, AfterViewChecked, ChangeDetectionStrategy, signal, computed, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HelpData } from '../../service/localStorage/data/help-data';

/**
 * External icon library global declaration (Lucide icons).
 */
declare var lucide: any;

/**
 * FAQ Interface
 * Defines the structure of FAQ objects used in Help Dashboard.
 */
interface FAQ {
  /** * Unique identifier for the FAQ 
   */
  id: number;

  /** * The category this FAQ belongs to (e.g., 'General', 'Billing') 
   */
  category: string;

  /** * The actual question text 
   */
  question: string;

  /** * The answer text to the question 
   */
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

  /** * Dependency injection for Angular FormBuilder 
   */
  private fb = inject(FormBuilder);

  /** * Dependency injection for DOM Sanitizer to safely inject HTML 
   */
  private sanitizer = inject(DomSanitizer);

  /** * Dependency injection for Platform ID to check execution context (Browser/Server) 
   */
  private platformId = inject(PLATFORM_ID);

  /** * Dependency injection for ChangeDetectorRef to manually trigger change detection 
   */
  private cdr = inject(ChangeDetectorRef);

  /** * FAQ static data source containing all help articles 
   */
  private readonly helpData: FAQ[] = HelpData;

  /* ------------------------------------------------------------------
     SIGNAL STATES (Reactive state management)
     ------------------------------------------------------------------ */

  /** * Stores the current user search query string 
   */
  searchQuery = signal<string>('');

  /** * Stores a Set of currently opened accordion IDs 
   */
  openAccordions = signal<Set<number>>(new Set());

  /** * Tracks if the contact form is currently submitting 
   */
  isSubmitting = signal<boolean>(false);

  /** * Tracks if the contact form submitted successfully 
   */
  submitSuccess = signal<boolean>(false);

  /** * Tracks if an error occurred during contact form submission 
   */
  submitError = signal<boolean>(false);

  /** * Tracks form field names that need a shake animation on validation error 
   */
  shakeFields = signal<Set<string>>(new Set());

  /* ------------------------------------------------------------------
     CONTACT FORM SETUP
     ------------------------------------------------------------------ */

  /** * Reactive form configuration with validation rules for the contact form 
   */
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
   * * @returns {FAQ[]} Array of filtered FAQ items based on the current search query
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
   * * @returns {Array<{category: string, items: FAQ[]}>} An array of objects grouping FAQs by their category
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
   * Injects fonts and icon libraries into the document.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.injectFontAwesome();
  }

  /**
   * AfterViewChecked lifecycle hook.
   * Ensures Lucide icons are re-rendered after DOM updates are completed.
   * * @returns {void}
   */
  ngAfterViewChecked(): void {
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
   * Dynamically injects the Lucide icon script and Google Font (Outfit).
   * Ensures execution only occurs in a browser environment to prevent SSR errors.
   * * @returns {void}
   */
  injectFontAwesome(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!document.getElementById('lucide-script')) {
      const script = document.createElement('script');
      script.id = 'lucide-script';
      script.src = 'https://unpkg.com/lucide@latest';

      script.onload = () => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
      };

      document.body.appendChild(script);
    }

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
   * Updates the search query signal when the user types in the search input.
   * * @param {Event} event - The DOM input event triggered by user typing
   * @returns {void}
   */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  /**
   * Clears the current search input.
   * * @returns {void}
   */
  resetSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * Sets the category filter and smoothly scrolls the FAQ container into view.
   * * @param {string} category - The category string to set as the active filter
   * @returns {void}
   */
  setCategory(category: string): void {
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
   * Toggles the open/close state of an FAQ accordion item.
   * * @param {number} id - The unique ID of the FAQ accordion to toggle
   * @returns {void}
   */
  toggleAccordion(id: number): void {
    const current = new Set(this.openAccordions());

    if (current.has(id)) current.delete(id);
    else current.add(id);

    this.openAccordions.set(current);
  }

  /**
   * Checks if a specific accordion item is currently open.
   * * @param {number} id - The unique ID of the FAQ accordion
   * @returns {boolean} True if the accordion is open, false otherwise
   */
  isAccordionOpen(id: number): boolean {
    return this.openAccordions().has(id);
  }

  /* ------------------------------------------------------------------
     SEARCH TEXT HIGHLIGHTING
     ------------------------------------------------------------------ */

  /**
   * Highlights matched search text within the FAQs by wrapping it in an HTML span.
   * Uses Angular's DomSanitizer to safely inject the formatted HTML.
   * * @param {string} text - The full text to search within
   * @param {string} query - The search query to highlight
   * @returns {SafeHtml} The sanitized HTML string containing highlight spans
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
   * Smoothly scrolls the page to the contact form section.
   * * @returns {void}
   */
  scrollToForm(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('contactFormSection')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Checks if a specific form control is invalid and has been touched or dirtied.
   * * @param {string} controlName - The form control name mapped in the FormGroup
   * @returns {boolean} True if the form control is invalid and user interacted with it
   */
  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /**
   * Determines if a specific form field should display a validation shake animation.
   * * @param {string} controlName - The form control name to check
   * @returns {boolean} True if the control requires a shake animation
   */
  shouldShake(controlName: string): boolean {
    return this.shakeFields().has(controlName);
  }

  /* ------------------------------------------------------------------
     FORM SUBMISSION LOGIC
     ------------------------------------------------------------------ */

  /**
   * Handles the contact form submission process.
   * Validates the form, triggers animations for invalid fields, sends a POST request 
   * to the backend API, and updates the UI state based on the response.
   * * @returns {Promise<void>} A promise that resolves when the submission process is complete
   */
  async onSubmit(): Promise<void> {
    this.submitSuccess.set(false);
    this.submitError.set(false);

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();

      const invalidFields = new Set<string>();
      Object.keys(this.contactForm.controls).forEach(key => {
        if (this.contactForm.get(key)?.invalid)
          invalidFields.add(key);
      });

      this.shakeFields.set(invalidFields);

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

      this.cdr.markForCheck();

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          if (typeof lucide !== 'undefined')
            lucide.createIcons();
        });
      }
    }
  }
}