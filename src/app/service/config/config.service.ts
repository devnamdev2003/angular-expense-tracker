import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

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
   * Stores the application version from the environment file.
   */
  private readonly version: string = environment.applicationVersion;

  /**
   * The production (live) API base URL.
   *
   * Example: `https://exwiseapi.onrender.com`
   */
  private readonly liveAPIUrl: string = environment.liveAPIUrl;

  /**
   * The local development API base URL.
   *
   * Example: `http://localhost:8000`
   */
  private readonly localAPIUrl: string = environment.localAPIUrl;

  /**
   * Creates an instance of ConfigService.
   */
  constructor() { }

  /**
   * Returns the appropriate API base URL depending on the environment.
   *
   * - `"local"` → `http://localhost:8000`
   * - `"live"` → `https://exwiseapi.onrender.com`
   * - Any other value → Determines based on current window location.
   * - If the URL contains `"localhost"`, returns `http://localhost:8000`.
   * - If the URL contains `"exwise"`, returns `https://exwiseapi.onrender.com`.
   * - Defaults to `http://localhost:8000` if none of the above conditions are met.
   * @returns {string} The API base URL for the current environment.
   */
  getapiUrl(): string {
    if (this.developmentEnvironment === "local") {
      return this.localAPIUrl;
    }
    else if (this.developmentEnvironment === "live") {
      return this.liveAPIUrl;
    }
    else {
      if (window.location.href.includes("localhost")) {
        return this.localAPIUrl;
      }
      else if (window.location.href.includes("exwise")) {
        return this.liveAPIUrl;
      }
      return this.localAPIUrl;
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

  /**
   * Returns the current application version.
   * 
   * @returns A string representing the app version
   */
  getVersion(): string {
    return this.version;
  }
}
