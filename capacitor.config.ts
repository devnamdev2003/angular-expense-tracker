import { CapacitorConfig } from '@capacitor/cli';

/**
 * The Capacitor configuration object for the ExpenseWise app.
 */
const config: CapacitorConfig = {
  /** Unique app package identifier (reverse-domain format) */
  appId: 'com.expensewise.app',

  /** Display name of the app as it appears on the device home screen */
  appName: 'Exwise',

  /** Path to the directory containing the built web application */
  webDir: 'dist/expense-wise/browser',

  /** Server configuration for live reload and production connections */
  server: {
    /** Deployed URL of the web app (used for live preview or production API access) */
    url: 'https://exwisedev.vercel.app',

    /** Allow non-HTTPS traffic for local debugging purposes */
    cleartext: true
  }
};

export default config;
