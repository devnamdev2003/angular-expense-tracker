import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

/** Application routes */
export const routes: Routes = [
    { path: '', component: AppComponent }, // your main app content
    { path: 'music', component: AppComponent }, // for music
    { path: '**', redirectTo: '' }, // catch-all
];
