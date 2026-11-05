import { Routes } from '@angular/router';
import {
  eventAdminGuard,
  eventGuard,
  eventOwnerGuard,
  roleGuard,
} from '@core/guards';

const routes: Routes = [
  {
    path: '',
    canActivate: [roleGuard('admin')],
    title: 'Administrar eventos',
    loadComponent: () => import('./admin-events/admin-events.component'),
  },
  {
    path: 'events/new',
    canActivate: [roleGuard('admin')],
    data: { mode: 'create' },
    title: 'Crear evento',
    loadComponent: () => import('./event-form/event-form.component'),
  },
  {
    path: 'events/:eventId',
    canActivate: [eventGuard],
    children: [
      {
        // Event co-admins (event.admins) don't need the global admin role to
        // manage registrations, so this route is gated per event only.
        path: '',
        canActivate: [eventAdminGuard],
        loadComponent: () => import('./event-admin/event-admin.component'),
      },
      {
        path: 'edit',
        canActivate: [roleGuard('admin'), eventOwnerGuard],
        data: { mode: 'edit' },
        title: 'Editar evento',
        loadComponent: () => import('./event-form/event-form.component'),
      },
    ],
  },
];

export default routes;
