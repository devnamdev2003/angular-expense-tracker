/**
 * Application environment configuration for development mode.
 * Use this file during development. It will be replaced by `environment.prod.ts` during build.
 */
export const environment = {

  /** 
   * Name of the application. 
   */
  appName: 'ExpenseWise',

  /**
   * Flag to indicate if the app is running in production mode.
   * Set to true in the production environment.
   */
  production: false,

  /**
   * API key for accessing the Gemini AI API.
   * Replace or secure this key before deploying to production.
   */
  geminiApiKey: 'AIzaSyBkBmHCsVna6d8bPYjQQhbpdymn7_Nvm2w',

  /**
   * Current environment type.
   * - 'local' for local development (uses localhost API endpoint)
   * - 'live' for production (uses production API endpoint)
   * - leave empty for automatic detection based on current window location
   */
  developmentEnvironment: '', // Change to 'live' for production or 'local' for local development

  /**
   * Application version.
   * This should be updated with each release to track application versions.
   */
  applicationVersion: '25.9.21', // Current application version

  /**
   * The production (live) API base URL.
   *
   * Example: `https://exwiseapi.onrender.com`
   */
  liveAPIUrl: "https://exwiseapi.onrender.com",

  /**
   * The local development API base URL.
   *
   * Example: `http://localhost:8000`
   */
  localAPIUrl: "http://localhost:8000"
};
