import { Routes } from '@angular/router';
import {
  adminGuard,
  authGuard,
  exitRegistrationGuard,
  registrationGuard,
} from '@core/guards';
import { eventsResolver } from '@core/resolvers';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./events.component'),
  },
  {
    path: ':id',
    resolve: {
      event: eventsResolver,
    },
    loadComponent: () => import('./event-details/event-details.component'),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./event-details/event-data/event-data.component'),
      },
      {
        path: 'register',
        canActivate: [authGuard, registrationGuard],
        canDeactivate: [exitRegistrationGuard],
        loadComponent: () =>
          import(
            './event-details/event-registration/event-registration.component'
          ),
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./event-details/event-admin/event-admin.component'),
      },
    ],
  },
];
