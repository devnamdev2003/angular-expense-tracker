import { Routes } from '@angular/router';
import { musicAccessGuard } from '../guards/music-url-access.guard';

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
        canActivate: [musicAccessGuard],
        loadComponent: () =>
            import('./features/music/music.component')
                .then(m => m.MusicComponent),
    },
    {
        path: 'music/search',
        canActivate: [musicAccessGuard],
        loadComponent: () =>
            import('./features/music/music-component/search-music/search-music.component')
                .then(m => m.SearchMusicComponent)
    },
    {
        path: 'music/playlist',
        canActivate: [musicAccessGuard],
        loadComponent: () =>
            import('./features/music/music-component/playlist-music/playlist-music.component')
                .then(m => m.PlaylistMusicComponent)
    },
    { path: '**', redirectTo: '' }
];
