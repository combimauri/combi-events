import { Routes } from '@angular/router';
import {
  registrationGuard,
  exitRegistrationGuard,
  adminGuard,
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
        canActivate: [registrationGuard],
        canDeactivate: [exitRegistrationGuard],
        loadComponent: () =>
          import(
            './event-details/event-registration/event-registration.component'
          ),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./event-details/event-admin/event-admin.component'),
      },
    ],
  },
];
