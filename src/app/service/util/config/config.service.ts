import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';

/**
 * Service responsible for providing configuration values across the application,
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  /**
   * The current environment setting taken from environment configuration.
   * 
   * Possible values:
   * - `"local"` → Uses localhost API endpoint.
   * - `"live"` → Uses production API endpoint.
   */
  private readonly developmentEnvironment: string = environment.developmentEnvironment;

  /** 
   * The application name, retrieved from environment settings. 
   */
  private readonly appName: string = environment.appName;

  /**
   * Creates an instance of ConfigService.
   */
  constructor() { }

  /**
   * Returns the appropriate API base URL depending on the environment.
   *
   * - `"local"` → `http://localhost:8000`
   * - `"live"` → `https://exwiseapi.onrender.com`
   * - Any other value defaults to `"local"`
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

  /**
   * Returns the application name defined in environment settings.
   *
   * @returns {string} The application name.
   */
  getAppName(): string {
    return this.appName;
  }
}
