import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Product } from '@core/models';
import { ProductsService } from '@core/services';
import { ProductState } from '@core/states';
import { map, tap } from 'rxjs';

export const productGuard: CanActivateFn = (route, state) => {
  const productId = route.params['productId'];
  const productsService = inject(ProductsService);
  const productState = inject(ProductState);
  const router = inject(Router);

  return productsService.getProductById(productId).pipe(
    tap((product) => saveEventState(productState, product)),
    map((product) => {
      if (product) {
        return true;
      }

      return router.createUrlTree(['/']);
    }),
  );
};

const saveEventState = (eventState: ProductState, product?: Product) => {
  if (product) {
    eventState.setProduct(product);
  } else {
    eventState.clearProduct();
  }
};
