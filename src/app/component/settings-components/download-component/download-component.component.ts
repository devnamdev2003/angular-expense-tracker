import { ExpenseService, Expense } from '../../../service/localStorage/expense.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../service/toast/toast.service';
import { FormModelComponent } from '../../form-model/form-model.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Component responsible for exporting user expenses
 * into JSON, PDF, or Excel formats within a given date range.
 *
 * This component provides a modal dialog with a form
 * to select a date range and file type, validates the input,
 * and triggers the download of filtered expense data.
 */
@Component({
  selector: 'app-download-component',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FormModelComponent,
  ],
  templateUrl: './download-component.component.html',
  styleUrl: './download-component.component.css'
})
export class DownloadComponentComponent {

  /**
   * Reactive form instance for selecting date range and file type.
   */
  downloadDataForm!: FormGroup;

  /**
   * Controls the visibility of the download data modal.
   */
  showDownloadDataModal = false;

  /**
   * Current date in `yyyy-MM-dd` format,
   * used for validation to prevent future dates.
   */
  today: string;

  /**
   * Creates an instance of `DownloadComponentComponent`.
   *
   * @param expenseService Service used to fetch and filter expenses.
   * @param fb Angular `FormBuilder` to build the reactive form.
   * @param toastService Service used to show toast notifications.
   */
  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder,
    private toastService: ToastService,
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

  /**
   * Lifecycle hook that initializes the form
   * with default controls and validators.
   */
  ngOnInit(): void {
    this.downloadDataForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      fileType: ['JSON', [Validators.required]],
    });
  }

  /**
   * Validates the form before triggering data download.
   *
   * Marks all controls as touched if the form is invalid.
   */
  downloadData(): void {
    if (this.downloadDataForm.invalid) {
      this.downloadDataForm.markAllAsTouched();
      return;
    }
    this.confirmAndDownload();
  }

  /**
   * Validates date range and triggers the appropriate
   * export function (JSON, PDF, Excel) based on user selection.
   */
  confirmAndDownload(): void {
    const { fromDate, toDate, fileType } = this.downloadDataForm.value;

    if (new Date(toDate) < new Date(fromDate)) {
      this.toastService.show('Invalid date range: To Date must be after From Date', 'error', 3000);
      return;
    }

    const data: Expense[] = this.expenseService.searchByDateRange(fromDate, toDate);

    if (!data || data.length === 0) {
      this.toastService.show('No expenses found in this date range', 'info', 3000);
      return;
    }

    // Filter fields for export
    const filteredData = data.map(expense => ({
      amount: expense.amount,
      date: expense.date,
      time: expense.time,
      location: expense.location,
      note: expense.note,
      payment_mode: expense.payment_mode,
      category_name: expense.category_name,
      category_id: expense.category_id,
      expense_id: expense.expense_id,
      isExtraSpending: expense.isExtraSpending
    }));

    try {
      if (fileType === 'JSON') {
        const jsonData = JSON.stringify(filteredData, null, 2);
        this.triggerDownload(jsonData, 'application/json', 'json');
        this.closeDownloadDataModal();
        this.toastService.show('JSON downloaded successfully!', 'success', 3000);
        return;
      } else if (fileType === 'PDF') {
        this.exportToPDF(filteredData, fromDate, toDate);
        this.closeDownloadDataModal();
        this.toastService.show('PDF downloaded successfully!', 'success', 3000);
        return;
      } else if (fileType === 'EXCEL') {
        this.exportToExcel(filteredData);
        this.closeDownloadDataModal();
        this.toastService.show('Excel downloaded successfully!', 'success', 3000);
        return;
      }
    } catch (error) {
      console.error('Download failed', error);
      this.toastService.show('Failed to download data', 'error');
    }
  }

  /**
   * Creates a file blob and triggers the browser to download it.
   *
   * @param content File content to download.
   * @param mimeType MIME type of the file.
   * @param extension File extension (json, pdf, xlsx).
   */
  private triggerDownload(content: string, mimeType: string, extension: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `expenses-${timestamp}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  /**
   * Opens the modal and resets the download form
   * to its initial state.
   */
  openDownloadDataModal(): void {
    this.downloadDataForm.reset({
      fromDate: '',
      toDate: '',
      fileType: 'JSON'
    });
    this.downloadDataForm.markAsPristine();
    this.downloadDataForm.markAsUntouched();
    this.showDownloadDataModal = true;
  }

  /**
   * Closes the download modal.
   */
  closeDownloadDataModal(): void {
    this.showDownloadDataModal = false;
  }

  /**
   * Exports expense data to a formatted PDF file.
   *
   * @param data Filtered expense records.
   * @param fromDate Start date of the report.
   * @param toDate End date of the report.
   */
  private exportToPDF(data: any[], fromDate: string, toDate: string): void {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title + metadata
    const title = 'Expenses Report';
    const sub = `From: ${fromDate}  —  To: ${toDate}`;
    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(10);
    doc.text(sub, pageWidth / 2, 58, { align: 'center' });

    // Table headers (order matches rows below)
    const headers = ['Index', 'Category', 'Amount', 'Date', 'Time', 'Location', 'Note', 'Payment Mode', 'Extra Spending'];

    // Rows
    const rows = data.map((exp, i) => [
      i + 1,
      exp.category_name,
      exp.amount,
      exp.date,
      exp.time,
      exp.location,
      exp.note,
      exp.payment_mode,
      exp.isExtraSpending ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      startY: 70,
      head: [headers],
      body: rows,
      styles: { fontSize: 9, overflow: 'linebreak' },
      headStyles: {
        fillColor: [143, 145, 234],
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
        textColor: 255
      },
      margin: { left: 30, right: 30 },
      bodyStyles: {
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 33 },                      // Index
        1: { cellWidth: 58, halign: 'left' },      // Category
        2: { cellWidth: 46 },                      // Amount
        3: { cellWidth: 55 },                      // Date
        4: { cellWidth: 50 },                      // Time
        5: { cellWidth: 85, halign: 'left' },      // Location
        6: { cellWidth: 110, halign: 'left' },     // Note (wraps)
        7: { cellWidth: 48 },                      // Payment Mode
        8: { cellWidth: 50 }                       // Extra Spending
      }
    });

    // file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    doc.save(`expenses-${timestamp}.pdf`);
  }

  /**
   * Exports expense data to an Excel file.
   *
   * @param data Filtered expense records.
   */
  private exportToExcel(data: any[]): void {
    const excelData = data.map((exp, i) => ({
      'Index': i + 1,
      Category: exp.category_name,
      Amount: exp.amount,
      Date: exp.date,
      Time: exp.time,
      Location: exp.location,
      Note: exp.note,
      'Payment Mode': exp.payment_mode,
      'Extra Spending': exp.isExtraSpending ? 'Yes' : 'No'
    }));

    const workbook = XLSX.utils.book_new();
    const aoa: any[][] = [];

    if (excelData.length > 0) {
      const headerRow = Object.keys(excelData[0]);
      aoa.push(headerRow);

      for (const row of excelData) {
        aoa.push(Object.values(row));
      }
    }

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `expenses-${timestamp}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

}
