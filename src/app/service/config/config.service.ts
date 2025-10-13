import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { UserService } from '../localStorage/user.service';

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
   * @param userService Service for managing user preferences
   */
  constructor(private userService: UserService) { }

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

  /**
  * Returns the current local time as a string in HH:MM:SS format
  */
  getLocalTime(): string {
    // 1. Get the current local time
    const now = new Date();

    // 2. Get components of local time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // 3. Combine into ISO-like string (local time)
    const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

    console.log(localISOString); // e.g. "2025-10-11T13:35:58.942"
    return localISOString;
  }

  /**
  * Returns the Gemini Api Key
  */
  getGeminiApiKey(): string | null {
    return this.userService.getValue<string>('ai_key');
  }
}
