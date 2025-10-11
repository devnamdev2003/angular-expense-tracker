import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Song } from '../../models/song.model';

/**
 * Service for managing user liked songs stored in localStorage.
 *
 * Features:
 * - Add, update, delete, and retrieve user liked songs.
 */
@Injectable({ providedIn: 'root' })
export class UserLikedSongsService {

    /**
     * Creates an instance of UserLikedSongsService.
     *
     * @param storageService Service for interacting with localStorage.
     */
    constructor(private storageService: StorageService) { }

    /**
     * Checks if the environment supports localStorage.
     *
     * @returns True if running in a browser with localStorage.
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    /**
     * Retrieves all liked songs from localStorage.
     *
     * @returns Array of formatted {@link Song} sorted by date (newest first).
     */
    getAll(): Song[] {
        if (!this.isBrowser()) return [];
        return this.storageService.getAllSongs();
    }

    /**
     * Adds a new liked song to localStorage.
     *
     * @param data Liked song data excluding `song_id`.
     */
    add(data: Song): void {
        if (!this.isBrowser()) return;
        const all: Song[] = this.getAll();
        all.push({ ...data });
        localStorage.setItem(this.storageService.getUserLikedSongsKey(), JSON.stringify(all));
    }


    /**
     * Retrieves a single liked song by its ID.
     *
     * @param song_id The ID of the songs to retrieve.
     * @returns The user liked songs object or null if not found.
     */
    getBySongId(song_id: string): Song | null {
        if (!this.isBrowser()) return null;
        return this.getAll().find(item => item.song_id === song_id) || null;
    }

    /**
     * Deletes an user liked songs by its ID.
     *
     * @param song_id The ID of the user liked songs to delete.
     */
    delete(song_id: string): void {
        if (!this.isBrowser()) return;
        let all: Song[] = this.getAll();
        all = all.filter(item => item.song_id !== song_id);
        localStorage.setItem(this.storageService.getUserLikedSongsKey(), JSON.stringify(all));
    }
}
