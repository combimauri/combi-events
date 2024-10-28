import { Routes } from '@angular/router';
import { productGuard } from '@core/guards';
import { productRecordResolver } from '@core/resolvers';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./event-marketplace.component'),
  },
  {
    path: ':productId',
    canActivate: [productGuard],
    resolve: {
      productRecord: productRecordResolver,
    },
    loadComponent: () =>
      import('./product-registration/product-registration.component'),
  },
];

export default routes;
