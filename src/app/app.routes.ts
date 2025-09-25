import { Routes } from '@angular/router';

/**
 * Application routes configuration.
 * 
 * This configuration defines the routes for the application, including
 * lazy-loaded feature modules.
 */
export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./features/expense-wise/expense-wise.component')
                .then(m => m.ExpenseWiseComponent)
    },
    {
        path: 'music',
        loadComponent: () =>
            import('./features/music/music.component')
                .then(m => m.MusicComponent),
    },
    {
        path: 'music/search',
        loadComponent: () =>
            import('./features/music/music-component/search-music/search-music.component')
                .then(m => m.SearchMusicComponent)
    },
    {
        path: 'music/playlist',
        loadComponent: () =>
            import('./features/music/music-component/playlist-music/playlist-music.component')
                .then(m => m.PlaylistMusicComponent)
    },
    { path: '**', redirectTo: '' },
    { path: 'music/**', redirectTo: '../music' }
];
