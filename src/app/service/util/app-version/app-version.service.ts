import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';

/**
 * Service to provide the current application version.
 * 
 * This version is typically injected from the environment configuration.
 */
@Injectable({
  providedIn: 'root'
})
export class AppVersionService {

  /**
   * Stores the application version from the environment file.
   */
  private readonly version: string = environment.applicationVersion;

  /**
   * Constructor for AppVersionService.
   */
  constructor() { }

  /**
   * Returns the current application version.
   * 
   * @returns A string representing the app version
   */
  getVersion(): string {
    return this.version;
  }
}
