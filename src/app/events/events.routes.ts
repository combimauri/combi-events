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
  },
];
