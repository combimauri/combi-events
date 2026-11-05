import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '@core/models';
import { UsersService } from '@core/services';
import { map, take } from 'rxjs';

/** Lets through only users whose `users/{uid}.roles` contains `role`. */
export const roleGuard =
  (role: UserRole): CanActivateFn =>
  () => {
    const router = inject(Router);

    return inject(UsersService)
      .hasRole$(role)
      .pipe(
        take(1),
        map((hasRole) => hasRole || router.createUrlTree(['/'])),
      );
  };
