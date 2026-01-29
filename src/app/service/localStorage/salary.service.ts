import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface representing a salary entry.
 */
export interface Salary {
    salary_id: string;
    amount: number;
    month: string;
    date: string;
    budget?: number;
    note?: string;
}

/**
 * Service responsible for managing salaries in local storage.
 * Provides methods to add, update, delete, and fetch salaries,
 * while ensuring data is only accessed in the browser environment.
 */
@Injectable({ providedIn: 'root' })
export class SalaryService {

    /**
     * Creates an instance of SalaryService.
     *
     * @param storageService A service for interacting with local storage keys and data.
     */
    constructor(
        private storageService: StorageService
    ) { }

    /**
     * Checks if the code is running in a browser environment with `localStorage` available.
     *
     * @returns {boolean} True if running in the browser, false otherwise.
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    /**
     * Retrieves all salarys stored in local storage.
     *
     * @returns {Salary[]} A list of all saved salarys, or an empty array if not in the browser.
     */
    getAll(): Salary[] {
        if (!this.isBrowser()) return [];
        return this.storageService.getAllSalaries();
    }

    /**
     * Adds a new salary entry to local storage.
     * Automatically generates a unique `salary_id` and rounds the amount to 2 decimals.
     *
     * @param data The salary data (without `salary_id`) to add.
     */
    add(data: Omit<Salary, 'salary_id'>): void {
        if (!this.isBrowser()) return;
        const all: Salary[] = this.getAll();
        const salary_id = crypto.randomUUID();
        all.push({ ...data, salary_id, amount: Math.round(data.amount * 100) / 100 });
        localStorage.setItem(this.storageService.getSalaryKey(), JSON.stringify(all));
    }

    /**
     * Updates an existing salary entry in local storage.
     * Matches by `salary_id` and merges with the provided data.
     * The amount is always rounded to 2 decimals.
     *
     * @param salary_id The ID of the salary to update.
     * @param newData Partial salary fields to update.
     */
    update(salary_id: string, newData: Partial<Salary>): void {
        if (!this.isBrowser()) return;
        let all: Salary[] = this.getAll();
        all = all.map(item =>
            item.salary_id === salary_id ? { ...item, ...newData } : item
        );
        all = all.map(item => (
            { ...item, amount: Math.round(item.amount * 100) / 100 }
        )
        );
        localStorage.setItem(this.storageService.getSalaryKey(), JSON.stringify(all));
    }

    /**
     * Deletes a salary entry from local storage.
     *
     * @param salary_id The ID of the salary to delete.
     */
    delete(salary_id: string): void {
        if (!this.isBrowser()) return;
        let all: Salary[] = this.getAll();
        all = all.filter(item => item.salary_id !== salary_id);
        localStorage.setItem(this.storageService.getSalaryKey(), JSON.stringify(all));
    }

    /**
     * Replaces all salarys in local storage with the provided list.
     *
     * @param salarys The new list of salarys to save.
     */
    updateAllSalaries(salarys: Salary[]): void {
        if (!this.isBrowser()) return;
        this.storageService.updateSalarys(salarys);
    }

    getSalaryByMonth(month: string): Salary | null {
        if (!this.isBrowser()) return null;
        const all: Salary[] = this.getAll();
        const salary = all.find(item => item.month === month);
        return salary || null;
    }

    getCurrentMonthSalary(): Salary | null {
        if (!this.isBrowser()) return null;
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return this.getSalaryByMonth(monthStr);
    }
}
