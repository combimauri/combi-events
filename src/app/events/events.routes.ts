import { Routes } from '@angular/router';
import {
  authGuard,
  eventGuard,
  exitRegistrationGuard,
  marketplaceGuard,
  platformGuard,
  registrationGuard,
} from '@core/guards';
import { eventRecordResolver, sessionRecordsResolver } from '@core/resolvers';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./events.component'),
  },
  {
    path: ':eventId',
    canActivate: [platformGuard, eventGuard],
    resolve: {
      eventRecord: eventRecordResolver,
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
        canActivate: [authGuard],
        loadComponent: () =>
          import('./event-details/event-admin/event-admin.component'),
      },
      {
        path: 'scanner',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./event-details/event-scanner/event-scanner.component'),
      },
      {
        path: 'marketplace',
        canActivate: [authGuard, marketplaceGuard],
        loadChildren: () =>
          import('./event-details/event-marketplace/event-marketplace.routes'),
      },
      {
        path: 'sessions',
        canActivate: [authGuard],
        resolve: {
          sessionRecords: sessionRecordsResolver,
        },
        loadComponent: () =>
          import('./event-details/event-sessions/event-sessions.component'),
      },
    ],
  },
];

export default routes;
