import { Component, OnInit, AfterViewChecked, ChangeDetectionStrategy, signal, computed, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var lucide: any;

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-help-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-dashboard.html',
  styleUrl: './help-dashboard.css'
})
export class HelpDashboard implements OnInit, AfterViewChecked {

  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  // Data Source
  private readonly helpData: FAQ[] = [
    { id: 101, category: "Getting Started", question: "What is Expense Wise?", answer: "Expense Wise is a mobile-first financial management app designed to help you track daily and monthly expenses. It uses Angular and Tailwind CSS for a fast, responsive experience." },
    { id: 102, category: "Getting Started", question: "Is my data private?", answer: "Yes. All data is stored in your device's <strong>LocalStorage</strong> by default. This means we don't see your financial data unless you explicitly enable cloud backup." },
    { id: 103, category: "Getting Started", question: "Can I use it on Desktop?", answer: "The app is designed 'Mobile-First' for optimal use on smartphones. However, it works on laptops as a Progressive Web App (PWA), though the layout remains narrow." },
    { id: 104, category: "Getting Started", question: "How do I install the app?", answer: "You can <a href='https://github.com/devnamdev2003/angular-expense-tracker/raw/refs/heads/main/exwise.apk' class='text-indigo-600 hover:underline'>download the APK</a> from our website or use the 'Add to Home Screen' feature in your browser to install it as a PWA." },
    { id: 201, category: "Features", question: "Discrete vs. Cumulative Graphs", answer: "<strong>Discrete</strong> shows spending for individual periods (e.g., just Monday's cost). <strong>Cumulative</strong> adds them up over time (e.g., Monday + Tuesday), showing your total spending trend." },
    { id: 202, category: "Features", question: "What does the Pie Chart show?", answer: "The Pie Chart visualizes your expenses split by Category (e.g., Food, Travel). It helps you identify where most of your money goes." },
    { id: 301, category: "Features", question: "How do I add an expense?", answer: "Tap the <strong>+ (Plus)</strong> button. Enter Amount, Date, Category, and Payment Mode. You can also add a location or mark it as 'Extra Spending' to separate it from regular bills." },
    { id: 302, category: "Features", question: "What is 'Extra Spending'?", answer: "This is a checkbox to mark non-essential or one-time large expenses. You can later filter these out in the List View to see your core living costs." },
    { id: 401, category: "Features", question: "How does the Calendar Heatmap work?", answer: "The heatmap colors days based on spending: <br>• <span class='text-emerald-600 font-bold'>Green</span>: Low spending<br>• <span class='text-amber-600 font-bold'>Yellow</span>: Moderate<br>• <span class='text-rose-600 font-bold'>Red</span>: High spending." },
    { id: 402, category: "Features", question: "Can I change Heatmap thresholds?", answer: "Yes. In Calendar view, click the summary table's <strong>Edit</strong> button. You can manually set the rupee limits for Red/Yellow/Green or use 'Auto' to base it on your daily budget." },
    { id: 501, category: "Budgeting", question: "How is 'Suggested/Day' calculated?", answer: "This is a smart metric. It takes your remaining budget and divides it by the days left in the month. If you overspend today, your suggested daily amount for tomorrow drops." },
    { id: 502, category: "Budgeting", question: "What do the progress bar colors mean?", answer: "• <strong>Green/Indigo:</strong> You have spent less than 50% of your budget.<br>• <strong>Orange:</strong> You are between 50% and 90%.<br>• <strong>Red:</strong> You have exceeded 90% or the total limit." },
    { id: 503, category: "Budgeting", question: "Income Tracking vs Budget Tracking", answer: "<strong>Income Tracking</strong> focuses on total earnings and savings rate. <strong>Budget Tracking</strong> is stricter, focusing on limiting expenses within a set monthly cap." },
    { id: 601, category: "Data & Settings", question: "How do I backup my data?", answer: "Go to Settings > Data Backup. You can enable automatic cloud sync or manually trigger a backup to our secure database." },
    { id: 602, category: "Data & Settings", question: "Can I export my expenses?", answer: "Yes! In Settings, click <strong>Download Data</strong>. You can export as PDF, Excel (XLSX), or JSON. You can filter the export by date range." },
    { id: 603, category: "Data & Settings", question: "How do I create a custom category?", answer: "Go to Settings > Add Category. Enter the name (e.g., 'Gym', 'Pet') and save. It will immediately appear in your dropdowns." },
    { id: 604, category: "Data & Settings", question: "I deleted the app. Is my data gone?", answer: "If you did not enable Cloud Backup or Export your data, it is likely lost because LocalStorage is cleared when the app is uninstalled." }
  ];

  // State Signals
  searchQuery = signal<string>('');
  openAccordions = signal<Set<number>>(new Set());

  // Form State
  isSubmitting = signal<boolean>(false);
  submitSuccess = signal<boolean>(false);
  submitError = signal<boolean>(false);
  shakeFields = signal<Set<string>>(new Set());

  // Form Setup
  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    query: ['', [Validators.required, Validators.minLength(10)]]
  });

  // Computed state for UI rendering
  filteredFAQs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.helpData;

    return this.helpData.filter(item =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  groupedFAQs = computed(() => {
    const items = this.filteredFAQs();
    const categories = [...new Set(items.map(i => i.category))];

    return categories.map(cat => ({
      category: cat,
      items: items.filter(i => i.category === cat)
    }));
  });

  ngOnInit() {
    // Only access 'document' if we are in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Inject Lucide script for icons
      if (!document.getElementById('lucide-script')) {
        const script = document.createElement('script');
        script.id = 'lucide-script';
        script.src = 'https://unpkg.com/lucide@latest';
        script.onload = () => {
          if (typeof lucide !== 'undefined') lucide.createIcons();
        };
        document.body.appendChild(script);
      }
    }
  }

  ngAfterViewChecked() {
    // Only execute icon creation if we are in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Re-render icons after dynamic content changes
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

  // --- Search & Filter Logic ---
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  resetSearch() {
    this.searchQuery.set('');
  }

  setCategory(category: string) {
    this.searchQuery.set(category);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        document.getElementById('faqContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  // --- Accordion Logic ---
  toggleAccordion(id: number) {
    const current = new Set(this.openAccordions());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.openAccordions.set(current);
  }

  isAccordionOpen(id: number): boolean {
    return this.openAccordions().has(id);
  }

  highlightText(text: string, query: string): SafeHtml {
    if (!query) return this.sanitizer.bypassSecurityTrustHtml(text);
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    const replaced = text.replace(regex, '<span class="bg-amber-200/50 text-slate-900 px-0.5 rounded shadow-sm font-medium">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }

  // --- Form Logic ---
  scrollToForm() {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('contactFormSection')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  shouldShake(controlName: string): boolean {
    return this.shakeFields().has(controlName);
  }

  async onSubmit() {
    this.submitSuccess.set(false);
    this.submitError.set(false);

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();

      // Trigger shake animation for invalid fields
      const invalidFields = new Set<string>();
      Object.keys(this.contactForm.controls).forEach(key => {
        if (this.contactForm.get(key)?.invalid) invalidFields.add(key);
      });
      this.shakeFields.set(invalidFields);

      // Clear shake after animation completes
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
      const response = await fetch('https://coders813-exwiseapi.hf.space/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

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
      this.cdr.markForCheck(); // Ensure change detection runs immediately

      // Re-trigger lucide icons since new DOM elements might have appeared
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          if (typeof lucide !== 'undefined') lucide.createIcons();
        });
      }
    }
  }
}