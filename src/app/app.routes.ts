import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./login/login.component'),
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadChildren: () => import('./events/events.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: '',
  }
];
