import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { EventState } from '@core/states';
import { map, take } from 'rxjs';

/**
 * Only the event owner may edit its attributes. Requires `eventGuard` to have
 * populated `EventState` first.
 */
export const eventOwnerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const event = inject(EventState).event()!;

  return inject(AuthService).user$.pipe(
    take(1),
    map((user) =>
      user?.email && user.email === event.owner
        ? true
        : router.createUrlTree(['/admin']),
    ),
  );
};
