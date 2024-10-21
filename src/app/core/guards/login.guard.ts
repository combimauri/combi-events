import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { map } from 'rxjs';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  return inject(AuthService).user$.pipe(
    map((user) => {
      if (!user) {
        return true;
      }

      const returnUrl = route.queryParams['returnUrl'];

      if (returnUrl) {
        return router.parseUrl(returnUrl);
      }

      return router.createUrlTree(['/']);
    }),
  );
};
