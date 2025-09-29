import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../app/service/localStorage/user.service';

/**
 * Music Access Guard
 *
 * This route guard is used to control access to routes that require
 * the user to have permission to access music URLs.
 *
 * It retrieves the `has_music_url_access` flag from the `UserService`.
 * - If the flag is `true`, the guard allows navigation to the route.
 * - If the flag is `false` or not set, the guard redirects the user
 *   to the home page (`'/'`) and prevents access to the protected route.
 *
 * Usage:
 * ```ts
 * {
 *   path: 'music',
 *   canActivate: [musicAccessGuard],
 *   loadChildren: () => import('./music/music.module').then(m => m.MusicModule)
 * }
 * ```
 *
 * @returns `true` if the user has access; otherwise redirects and returns `false`.
 */
export const musicAccessGuard: CanActivateFn = () => {

    const userService = inject(UserService);
    const router = inject(Router);
    const hasAccess =
        userService.getValue<boolean>('has_music_url_access') ?? false;

    if (hasAccess) {
        return true;
    } else {
        router.navigateByUrl('/');
        return false;
    }
};
