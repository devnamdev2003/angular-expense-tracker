import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Salary
 * ------
 * Represents a single salary or income entry stored in local storage.
 */
export interface Salary {

    /** Unique identifier for the salary entry */
    salary_id: string;

    /** Income amount */
    amount: number;

    /** Month associated with the salary (YYYY-MM) */
    month: string;

    /** Date when the salary was recorded (YYYY-MM-DD) */
    date: string;

    /** Optional monthly budget linked to the salary */
    budget?: number;

    /** Optional note or description */
    note?: string;

    /** View mode: 'salary' or 'budget' */
    viewMode: string;
}

/**
 * SalaryService
 * -------------
 * This service manages salary-related operations using browser local storage.
 *
 * Responsibilities:
 * - Store salary data persistently
 * - Add, update, delete salary entries
 * - Retrieve salaries by month or as a list
 *
 * Safety:
 * - Ensures all operations run only in browser environments
 */
@Injectable({ providedIn: 'root' })
export class SalaryService {

    /**
     * Creates an instance of SalaryService
     *
     * @param storageService Utility service for local storage key management
     */
    constructor(
        private storageService: StorageService
    ) { }

    /**
     * Checks whether the code is running in a browser
     * and `localStorage` is available.
     *
     * @returns True if browser environment, otherwise false
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined'
            && typeof window.localStorage !== 'undefined';
    }

    /**
     * Retrieves all salary entries from local storage.
     *
     * @returns An array of Salary objects or an empty array
     */
    getAll(): Salary[] {
        if (!this.isBrowser()) return [];
        return this.storageService.getAllSalaries();
    }

    /**
     * Adds a new salary entry to local storage.
     *
     * Behavior:
     * - Generates a unique `salary_id`
     * - Rounds amount to 2 decimal places
     *
     * @param data Salary data excluding the salary_id
     */
    add(data: Omit<Salary, 'salary_id'>): void {
        if (!this.isBrowser()) return;

        const all: Salary[] = this.getAll();
        const salary_id = crypto.randomUUID();

        all.push({
            ...data,
            salary_id,
            amount: Math.round(data.amount * 100) / 100
        });

        localStorage.setItem(
            this.storageService.getSalaryKey(),
            JSON.stringify(all)
        );
    }

    /**
     * Updates an existing salary entry.
     *
     * Behavior:
     * - Matches salary by `salary_id`
     * - Merges existing data with new values
     * - Ensures amount is rounded to 2 decimals
     *
     * @param salary_id Unique ID of the salary to update
     * @param newData Partial salary data to update
     */
    update(salary_id: string, newData: Partial<Salary>): void {
        if (!this.isBrowser()) return;

        let all: Salary[] = this.getAll();

        all = all.map(item =>
            item.salary_id === salary_id
                ? { ...item, ...newData }
                : item
        );

        all = all.map(item => ({
            ...item,
            amount: Math.round(item.amount * 100) / 100
        }));

        localStorage.setItem(
            this.storageService.getSalaryKey(),
            JSON.stringify(all)
        );
    }

    /**
     * Deletes a salary entry from local storage.
     *
     * @param salary_id ID of the salary to remove
     */
    delete(salary_id: string): void {
        if (!this.isBrowser()) return;

        const all: Salary[] = this.getAll()
            .filter(item => item.salary_id !== salary_id);

        localStorage.setItem(
            this.storageService.getSalaryKey(),
            JSON.stringify(all)
        );
    }

    /**
     * Replaces all salary entries in local storage.
     *
     * @param salarys Complete list of salary entries
     */
    updateAllSalaries(salarys: Salary[]): void {
        if (!this.isBrowser()) return;
        this.storageService.updateSalarys(salarys);
    }

    /**
     * Retrieves the salary entry for a specific month.
     *
     * @param month Month in YYYY-MM format
     * @returns Salary entry if found, otherwise null
     */
    getSalaryByMonth(month: string): Salary | null {
        if (!this.isBrowser()) return null;

        const all: Salary[] = this.getAll();
        const salary = all.find(item => item.month === month);

        return salary || null;
    }

    /**
     * Filters salary records based on a given date range.
     *
     * @param fromMonth Optional start month (YYYY-MM).
     * @param toMonth Optional end month (YYYY-MM).
     * @returns Filtered array of Salary objects.
     */
    searchByDateRange(fromMonth?: string | null, toMonth?: string | null): Salary[] {
        if (!this.isBrowser()) return [];

        const all: Salary[] = this.getAll();

        return all.filter(item => {
            if (item.viewMode !== 'salary') return false;

            if (fromMonth && toMonth) {
                return item.month >= fromMonth && item.month <= toMonth;
            }

            if (fromMonth) {
                return item.month >= fromMonth;
            }

            if (toMonth) {
                return item.month <= toMonth;
            }

            return true;
        });
    }
}
