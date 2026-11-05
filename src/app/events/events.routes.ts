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
    canActivate: [platformGuard],
    loadComponent: () => import('./events.component'),
  },
  {
    // Event management moved to the admin area. Kept as a redirect so old
    // links (e.g. organizer notification emails) keep working.
    path: ':eventId/admin',
    pathMatch: 'full',
    redirectTo: '/admin/events/:eventId',
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
        path: 'staff-registration',
        canActivate: [authGuard],
        canDeactivate: [exitRegistrationGuard],
        loadComponent: () =>
          import(
            './event-details/event-registration/event-registration.component'
          ),
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
