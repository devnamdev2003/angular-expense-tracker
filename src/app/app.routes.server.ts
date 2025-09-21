import { RenderMode, ServerRoute } from '@angular/ssr';

/** Application routes for server-side rendering */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
