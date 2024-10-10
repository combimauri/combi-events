import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  return auth.loggedIn$.pipe(
    map((loggedIn) => {
      if (loggedIn) {
        return true;
      }

      const returnUrl = route.queryParams['returnUrl'] || state.url;

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl },
      });
    }),
  );
};
