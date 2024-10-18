import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login.component'),
  },
  {
    path: 'verify-link',
    loadComponent: () => import('./verify-link/verify-link.component'),
  },
];
