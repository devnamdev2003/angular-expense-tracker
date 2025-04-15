import { Routes } from '@angular/router';
import { share } from 'rxjs';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('./features/add-expense/add-expense.component').then(m => m.AddExpenseComponent)
    },
    {
        path: 'list',
        loadComponent: () => import('./features/list-expenses/list-expenses.component').then(m => m.ListExpensesComponent)
    },
    {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
    },
    {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];