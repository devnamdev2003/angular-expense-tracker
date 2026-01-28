import { Component, ChangeDetectionStrategy, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface PersonalSalaryRecord {
  id: string;
  month: string;
  year: number;
  company: string;
  amount: number;
  bonus: number;
  deductions: number;
  status: 'Received' | 'Expected';
  date: string;
}

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  themeMode = signal<'light' | 'dark'>('dark');
  showAddModal = signal(false);
  showToast = signal(false);
  toastMessage = signal('Logged successfully');
  editingId = signal<string | null>(null);

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  records = signal<PersonalSalaryRecord[]>([]);

  salaryForm = this.fb.group({
    month: ['January', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    bonus: [0, Validators.min(0)],
    deductions: [0, Validators.min(0)],
    status: ['Received', Validators.required],
    company: ['My Company']
  });

  constructor() {
    // 1. Theme Persistence
    effect(() => {
      const mode = this.themeMode();
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.theme_mode = mode;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        localStorage.setItem('user', JSON.stringify({ theme_mode: mode }));
      }
    });

    // 2. Data Persistence (Save records whenever they change)
    effect(() => {
      const currentRecords = this.records();
      if (currentRecords.length > 0 || localStorage.getItem('salary_records')) {
        localStorage.setItem('salary_records', JSON.stringify(currentRecords));
      }
    });
  }

  ngOnInit() {
    this.loadTheme();
    this.loadRecords();
  }

  loadTheme() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.theme_mode === 'light' || user.theme_mode === 'dark') {
          this.themeMode.set(user.theme_mode);
        }
      }
    } catch (e) {
      console.warn('Could not parse user theme from localstorage');
    }
  }

  loadRecords() {
    try {
      const savedData = localStorage.getItem('salary_records');
      if (savedData) {
        this.records.set(JSON.parse(savedData));
      } else {
        // Initial Mock Data if nothing is saved
        this.records.set([
          { id: '1', month: 'December', year: 2025, company: 'Tech Solutions Inc', amount: 75000, bonus: 5000, deductions: 2500, status: 'Received', date: 'Dec 01' },
          { id: '2', month: 'January', year: 2026, company: 'Tech Solutions Inc', amount: 75000, bonus: 0, deductions: 2500, status: 'Received', date: 'Jan 01' }
        ]);
      }
    } catch (e) {
      console.error('Error loading records', e);
    }
  }

  toggleTheme() {
    this.themeMode.update(prev => prev === 'light' ? 'dark' : 'light');
  }

  getTotalEarnings() {
    const total = this.records().reduce((acc, curr) => acc + (curr.amount + curr.bonus - curr.deductions), 0);
    return total.toLocaleString();
  }

  getLastSalary() {
    if (this.records().length === 0) return '0';
    const last = this.records()[this.records().length - 1];
    return (last.amount + last.bonus - last.deductions).toLocaleString();
  }

  getAvgBonus() {
    if (this.records().length === 0) return '0';
    const totalBonus = this.records().reduce((acc, curr) => acc + curr.bonus, 0);
    return Math.round(totalBonus / this.records().length).toLocaleString();
  }

  getGrowth() {
    return (Math.random() * 5 + 2).toFixed(1);
  }

  getIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'wallet': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>`,
      'plus': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
      'x': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
      'check': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
      'sun': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
      'moon': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
      'pencil': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
      'trash': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[name] || '');
  }

  // --- Actions ---

  openAddModal() {
    this.editingId.set(null);
    this.salaryForm.reset({ month: 'January', status: 'Received', bonus: 0, deductions: 0, company: 'My Company' });
    this.showAddModal.set(true);
  }

  closeModal() {
    this.showAddModal.set(false);
    this.editingId.set(null);
  }

  editRecord(record: PersonalSalaryRecord) {
    this.editingId.set(record.id);
    this.salaryForm.patchValue({
      month: record.month,
      amount: record.amount,
      bonus: record.bonus,
      deductions: record.deductions,
      status: record.status,
      company: record.company
    });
    this.showAddModal.set(true);
  }

  deleteRecord(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.records.update(prev => prev.filter(r => r.id !== id));
      this.triggerToast('Deleted successfully');
    }
  }

  onSubmit() {
    if (this.salaryForm.valid) {
      const val = this.salaryForm.value;
      const editingId = this.editingId();

      if (editingId) {
        // Update Existing
        this.records.update(prev => prev.map(r => {
          if (r.id === editingId) {
            return {
              ...r,
              month: val.month!,
              amount: val.amount!,
              bonus: val.bonus || 0,
              deductions: val.deductions || 0,
              status: val.status as 'Received' | 'Expected',
              company: val.company || r.company
            };
          }
          return r;
        }));
        this.triggerToast('Updated successfully');
      } else {
        // Create New
        const newRecord: PersonalSalaryRecord = {
          id: Math.random().toString(36).substring(2, 9),
          month: val.month!,
          year: new Date().getFullYear(),
          company: val.company || 'Company Name',
          amount: val.amount!,
          bonus: val.bonus || 0,
          deductions: val.deductions || 0,
          status: val.status as 'Received' | 'Expected',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        };
        this.records.update(r => [...r, newRecord]);
        this.triggerToast('Logged successfully');
      }

      this.closeModal();
    }
  }

  triggerToast(msg: string) {
    this.toastMessage.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }
}