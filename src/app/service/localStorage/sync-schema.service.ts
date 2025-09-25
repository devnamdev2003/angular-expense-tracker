import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ConfigService } from '../config/config.service';
import { Categories } from './data/categories';
import { Schema } from './storage.service';

/**
 * Service to synchronize local storage data with the current application schema.
 * Ensures that stored data conforms to the latest schema definitions.
 * This service should be invoked during application initialization.
 */
@Injectable({ providedIn: 'root' })
export class SyncSchemaService {

    /**
     * Creates an instance of SyncSchemaService.
     *
     * @param storageService A service for interacting with local storage keys and data.
     */
    constructor(
        private storageService: StorageService,
        private configService: ConfigService
    ) { }

    /**
     * Checks if the code is running in a browser environment with `localStorage` available.
     *
     * @returns {boolean} True if running in the browser, false otherwise.
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    syncAllSchema(): void {
        if (this.isBrowser()) {
            this.syncUser(this.storageService.getUserKey(), this.storageService.getuserSchema());
            this.syncWithSchema(this.storageService.getCategoryKey(), this.storageService.getcategorySchema());
            this.syncWithSchema(this.storageService.getExpenseKey(), this.storageService.getexpenseSchema());
            this.syncWithSchema(this.storageService.getBudgetKey(), this.storageService.getbudgetSchema());
            this.syncWithSchema(this.storageService.getUserLikedSongsKey(), this.storageService.getlikedSongSchema());
        }
    }

    /**
     * Helper function to sync any localStorage data array with a given schema.
     *
     * @param storageKey The localStorage key to sync.
     * @param defaultSchema The default schema to apply to missing properties.
     */
    private syncWithSchema(storageKey: string, defaultSchema: Schema): void {
        if (!this.isBrowser()) {
            console.error('localStorage is not available in this environment.');
            return;
        }

        let savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (storageKey === this.storageService.getCategoryKey()) {
            const pastData = JSON.parse(localStorage.getItem(this.storageService.getCategoryKey()) || '[]');
            const filteredPastData = pastData.filter((item: any) => item.user_id !== "0");
            savedData = [...filteredPastData, ...Categories];
        }

        const schemaKeys = Object.keys(defaultSchema);
        const updatedData = savedData.map((item: Schema) => {
            const synced: Schema = {};
            schemaKeys.forEach((key: string) => {
                synced[key] = key in item ? item[key] : defaultSchema[key];
            });
            return synced;
        });

        localStorage.setItem(storageKey, JSON.stringify(updatedData));
    }

    /**
     * Syncs user data in localStorage with a schema and updates the app version.
     *
     * @param storageKey The localStorage key for the user.
     * @param defaultSchema The default schema to apply.
     */
    private syncUser(storageKey: string, defaultSchema: Schema): void {
        if (!this.isBrowser()) {
            console.error('localStorage is not available in this environment.');
            return;
        }

        const savedSettings = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const schemaKeys = Object.keys(defaultSchema);
        const syncedSettings: Schema = {};

        schemaKeys.forEach((key: string) => {
            syncedSettings[key] = key in savedSettings ? savedSettings[key] : defaultSchema[key];
        });
        syncedSettings['app_version'] = this.configService.getVersion();

        localStorage.setItem(this.storageService.getUserKey(), JSON.stringify(syncedSettings));
    }

}
