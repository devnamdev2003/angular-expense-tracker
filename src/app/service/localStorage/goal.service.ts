import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface representing a Goal.
 */
export interface Goal {
    goal_id: string;
    goal_name: string;
    target_amount: number;
    start_date: string;
    target_date: string;
    note: string;
}

/**
 * Service for managing user goals stored in localStorage.
 *
 * Features:
 * - Add goal
 * - Update goal
 * - Delete goal
 * - Retrieve goals
 */
@Injectable({ providedIn: 'root' })
export class GoalService {

    /**
     * Creates an instance of GoalService.
     * 
     * @param storageService Service for interacting with localStorage.
     */
    constructor(private storageService: StorageService) { }

    /**
     * Checks if the environment supports localStorage.
     *
     * @returns True if running in browser.
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    /**
     * Retrieves all goals from localStorage.
     *
     * Sorted by start_date (latest first).
     *
     * @returns Array of Goal objects.
     */
    getAll(): Goal[] {
        if (!this.isBrowser()) return [];

        return this.storageService.getAllGoals().sort((a: Goal, b: Goal) => {
            const dateA = new Date(a?.start_date || 0).getTime();
            const dateB = new Date(b?.start_date || 0).getTime();

            const safeA = isNaN(dateA) ? 0 : dateA;
            const safeB = isNaN(dateB) ? 0 : dateB;

            return safeB - safeA; // newest first
        });
    }

    /**
     * Adds a new goal.
     *
     * @param data Goal object
     */
    add(data: Omit<Goal, 'goal_id'>): void {
        if (!this.isBrowser()) return;
        const all: Goal[] = this.getAll();
        const goal_id = crypto.randomUUID();
        all.push({ ...data, goal_id, target_amount: Math.round(data.target_amount * 100) / 100 });
        localStorage.setItem(
            this.storageService.getGoalKey(),
            JSON.stringify(all)
        );
    }

    /**
     * Updates an existing goal.
     *
     * @param updatedGoal Updated goal object
     */
    update(goal_id: string, newData: Partial<Goal>): void {
        if (!this.isBrowser()) return;
        let all: Goal[] = this.getAll();
        all = all.map(item => item.goal_id === goal_id ? { ...item, ...newData } : item);
        all = all.map(item => ({ ...item, target_amount: Math.round(item.target_amount * 100) / 100 }));
        localStorage.setItem(
            this.storageService.getGoalKey(),
            JSON.stringify(all)
        );
    }

    /**
     * Deletes a goal by ID.
     *
     * @param goal_id Goal ID
     */
    delete(goal_id: string): void {
        if (!this.isBrowser()) return;
        let all: Goal[] = this.getAll();
        all = all.filter(goal => goal.goal_id !== goal_id);
        localStorage.setItem(
            this.storageService.getGoalKey(),
            JSON.stringify(all)
        );
    }
}