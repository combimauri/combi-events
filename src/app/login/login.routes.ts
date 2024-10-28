import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login.component'),
  },
  {
    path: 'verify-link',
    loadComponent: () => import('./verify-link/verify-link.component'),
  },
];

export default routes;
