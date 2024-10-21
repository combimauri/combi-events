import { Routes } from '@angular/router';
import { loginGuard, platformGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [platformGuard, loginGuard],
    loadChildren: () => import('./login/login.routes').then((m) => m.routes),
  },
  {
    path: '',
    canActivate: [platformGuard],
    loadChildren: () => import('./events/events.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
