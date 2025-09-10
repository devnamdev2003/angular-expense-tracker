/**
 * Application environment configuration for development mode.
 * Use this file during development. It will be replaced by `environment.prod.ts` during build.
 */
export const environment = {
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
   * Possible values: 'local', 'live'
   */
  developmentEnvironment: 'live', // Change to 'live' for production or 'local' for local development

  /**
   * Application version.
   * This should be updated with each release to track application versions.
   */
  applicationVersion: '25.9.10', // Current application version
};
