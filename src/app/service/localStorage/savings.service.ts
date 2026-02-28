import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface representing a Saving entry.
 */
export interface Saving {
    saving_id: string;
    amount: number;
    date: string;
    note: string;
    is_from_income?: boolean;
}

/**
 * Service for managing savings entries stored in localStorage.
 *
 * Features:
 * - Add saving
 * - Update saving
 * - Delete saving
 * - Retrieve savings
 */
@Injectable({ providedIn: 'root' })
export class SavingsService {

    /**
     * Creates an instance of SavingsService.
     *
     * @param storageService Service for interacting with localStorage.
     */
    constructor(private storageService: StorageService) { }

    /**
     * Checks if the environment supports localStorage.
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    /**
     * Retrieves all savings from localStorage.
     *
     * Sorted by date (latest first).
     *
     * @returns Array of Saving objects.
     */
    getAll(): Saving[] {
        if (!this.isBrowser()) return [];

        return this.storageService.getAllSavings().sort((a: Saving, b: Saving) => {
            const dateA = new Date(a?.date || 0).getTime();
            const dateB = new Date(b?.date || 0).getTime();

            const safeA = isNaN(dateA) ? 0 : dateA;
            const safeB = isNaN(dateB) ? 0 : dateB;

            return safeB - safeA;
        });
    }

    /**
     * Adds a new saving entry.
     *
     * @param data Saving object
     */
    add(data: Omit<Saving, 'saving_id'>): void {
        if (!this.isBrowser()) return;
        const all: Saving[] = this.getAll();
        const saving_id = crypto.randomUUID();
        all.push({ ...data, saving_id, amount: Math.round(data.amount * 100) / 100 });
        localStorage.setItem(
            this.storageService.getSavingsKey(),
            JSON.stringify(all)
        );
    }

    /**
     * Updates an existing saving entry.
     *
     * @param updatedSaving Updated saving object
     */
    update(saving_id: string, newData: Partial<Saving>): void {
        if (!this.isBrowser()) return;
        let all: Saving[] = this.getAll();
        all = all.map(item => item.saving_id === saving_id ? { ...item, ...newData } : item);
        all = all.map(item => ({ ...item, amount: Math.round(item.amount * 100) / 100 }));
        localStorage.setItem(
            this.storageService.getSavingsKey(),
            JSON.stringify(all)
        );
    }

    /**
     * Deletes a saving entry by ID.
     *
     * @param saving_id Saving ID
     */
    delete(saving_id: string): void {
        if (!this.isBrowser()) return;
        let all: Saving[] = this.getAll();
        all = all.filter(saving => saving.saving_id !== saving_id);
        localStorage.setItem(
            this.storageService.getSavingsKey(),
            JSON.stringify(all)
        );
    }

    getTotalSavings(): number {
        if (!this.isBrowser()) return 0;
        const all: Saving[] = this.getAll();
        return all.reduce((acc, item) => acc + item.amount, 0);
    }

    getTotalSavingsFromIncome(): number {
        if (!this.isBrowser()) return 0;
        const all: Saving[] = this.getAll();
        return all.filter(item => item.is_from_income).reduce((acc, item) => acc + item.amount, 0);
    }

    gettotalSavingsBetweenDates(from: string | null, to: string | null): number {
        if (!this.isBrowser()) return 0;
        if (from && to) {
            const all: Saving[] = this.getAll();
            return all.filter(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                const fromDate = new Date(from);
                const toDate = new Date(to);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);
                return itemDate >= fromDate && itemDate <= toDate;
            }).reduce((acc, item) => acc + item.amount, 0);
        }
        return 0;
    }
}