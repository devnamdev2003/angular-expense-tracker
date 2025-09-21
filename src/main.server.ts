import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/** Bootstrap the Angular application with server-specific configuration */
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
