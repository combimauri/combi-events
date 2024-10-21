import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, EventsService } from '@core/services';
import { combineLatest, map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const eventId = route.parent?.params['id'];

  if (!eventId) {
    return router.createUrlTree(['/']);
  }

  const eventsService = inject(EventsService);
  const user$ = inject(AuthService).user$;
  const data$ = combineLatest([user$, eventsService.getEventById(eventId)]);

  return data$.pipe(
    map(([user, event]) => {
      if (!event) {
        return router.createUrlTree(['/']);
      }

      if (user?.email !== event.owner) {
        return router.createUrlTree([eventId]);
      }

      return true;
    }),
  );
};
