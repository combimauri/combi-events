import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { EventState } from '@core/states';
import { map, take } from 'rxjs';

/**
 * Allows the event owner and the event's co-admins (`event.admins`) to manage
 * an event. Requires `eventGuard` to have populated `EventState` first.
 */
export const eventAdminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const event = inject(EventState).event()!;
  const user$ = inject(AuthService).user$;

  return user$.pipe(
    take(1),
    map((user) => {
      const email = user?.email;

      if (email && (email === event.owner || event.admins.includes(email))) {
        return true;
      }

      return router.createUrlTree(['/', event.id]);
    }),
  );
};
