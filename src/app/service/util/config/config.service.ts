import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';

/**
 * Service responsible for providing configuration values across the application,
 * such as API base URLs based on the current environment (local or live).
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  /**
   * The current environment setting.
   * Possible values: 'local' | 'live'.
   * Change this value to switch API endpoints.
   */
  private readonly developmentEnvironment: string = environment.developmentEnvironment;
  /**
   * Creates an instance of ConfigService.
   */
  constructor() { }

  /**
   * Returns the appropriate API base URL based on the development environment.
   *
   * @returns {string} The API base URL for the current environment.
   */
  getapiUrl(): string {
    if (this.developmentEnvironment === "local") {
      return "http://localhost:8000";
    }
    else if (this.developmentEnvironment === "live") {
      return "https://exwiseapi.onrender.com";
    }
    else {
      return "http://localhost:8000";
    }
  }
}
