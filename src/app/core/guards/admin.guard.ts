import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { EventState } from '@core/states';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const event = inject(EventState).event()!;
  const user$ = inject(AuthService).user$;

  return user$.pipe(
    map((user) => {
      if (user?.email !== event.owner) {
        return router.createUrlTree([event.id]);
      }

      return true;
    }),
  );
};
