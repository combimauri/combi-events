import { Routes } from '@angular/router';
import { authGuard, loginGuard, platformGuard, seoGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [platformGuard, loginGuard],
    loadChildren: () => import('./login/login.routes'),
  },
  {
    // Must be declared before '' so "admin" is never matched as an :eventId.
    path: 'admin',
    canActivate: [platformGuard, authGuard],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: '',
    // seoGuard must come before any platformGuard-gated descendant: Angular
    // runs canActivate for the whole matched tree before resolvers, so it
    // has to be a guard (not a resolver) to run during SSR regardless of
    // whether the content route further down gets blocked.
    canActivate: [seoGuard],
    runGuardsAndResolvers: 'always',
    loadChildren: () => import('./events/events.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
