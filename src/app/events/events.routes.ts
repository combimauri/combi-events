import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/admin.guard';
import { exitRegistrationGuard } from '../core/guards/exit-registration.guard';
import { registrationGuard } from '../core/guards/registration.guard';
import { eventsResolver } from '../core/resolvers/events.resolver';

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
          import(
            './event-details/event-admin/event-admin.component'
          ),
      },
    ],
  },
];
