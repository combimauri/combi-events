import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  return inject(AuthService).user$.pipe(
    map((user) => {
      if (user) {
        return true;
      }

      const returnUrl = route.queryParams['returnUrl'] || state.url;

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl },
      });
    }),
  );
};
