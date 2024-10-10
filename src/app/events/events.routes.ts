import { Routes } from '@angular/router';
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
          import(
            './event-details/event-data/event-data.component'
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import(
            './event-details/event-registration/event-registration.component'
          ),
      },
    ],
  },
];
