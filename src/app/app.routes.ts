import { Routes } from '@angular/router';
import { authGuard, loginGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadChildren: () => import('./login/login.routes').then((m) => m.routes),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./events/events.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
