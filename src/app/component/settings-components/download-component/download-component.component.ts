import { ExpenseService, Expense } from '../../../service/localStorage/expense.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../service/toast/toast.service';
import { FormModelComponent } from '../../form-model/form-model.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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

  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder,
    private toastService: ToastService,
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

  downloadDataForm!: FormGroup;

  showDownloadDataModal = false;

  today: string;

  ngOnInit(): void {
    this.downloadDataForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      fileType: ['JSON', [Validators.required]],
    });
  }

  downloadData() {
    if (this.downloadDataForm.invalid) {
      this.downloadDataForm.markAllAsTouched();
      return;
    }
    this.confirmAndDownload();
  }

  /**
   * Confirm and download all expenses as a JSON file.
   */
  confirmAndDownload(): void {
    const { fromDate, toDate, fileType } = this.downloadDataForm.value;

    // Guard: Ensure toDate >= fromDate
    if (new Date(toDate) < new Date(fromDate)) {
      this.toastService.show('Invalid date range: To Date must be after From Date', 'error', 3000);
      return;
    }

    const data: Expense[] = this.expenseService.searchByDateRange(fromDate, toDate);

    if (!data || data.length === 0) {
      this.toastService.show('No expenses found in this date range', 'info', 3000);
      return;
    }

    // Filter fields
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
        this.toastService.show('Data downloaded successfully!', 'success', 3000);
        return;
      }
      else if (fileType === 'PDF') {
        this.exportToPDF(filteredData);
        this.closeDownloadDataModal();
        this.toastService.show('PDF downloaded successfully!', 'success', 3000);
        return;
      }
      else if (fileType === 'EXCEL') {
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

  private triggerDownload(content: string, mimeType: string, extension: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `expenses-${timestamp}.${extension}`;

    link.click();
    window.URL.revokeObjectURL(url);
  }

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


  closeDownloadDataModal(): void {
    this.showDownloadDataModal = false;
  }


  private exportToPDF(data: any[]): void {
    const doc = new jsPDF();

    // Table headers
    const headers = ['Index', 'Amount', 'Date', 'Time', 'Location', 'Note', 'Payment Mode', 'Category', 'Extra Spending'];

    // Table rows with index
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
      head: [headers],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] }, // nice blue
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    doc.save(`expenses-${timestamp}.pdf`);
  }


  private exportToExcel(data: any[]): void {
    // Add index column
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

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveAs(blob, `expenses-${timestamp}.xlsx`);
  }

}
