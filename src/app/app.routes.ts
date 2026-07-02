import { Routes } from '@angular/router';
import { loginGuard, platformGuard, seoGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [platformGuard, loginGuard],
    loadChildren: () => import('./login/login.routes'),
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
