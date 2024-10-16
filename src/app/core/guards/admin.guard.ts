import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EventsService } from '@core/services';
import { UserState } from '@core/states';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const userState = inject(UserState);
  const user = userState.currentUser();
  const eventId = route.parent?.params['id'];

  if (!eventId || !user) {
    return router.createUrlTree(['/']);
  }

  const eventsService = inject(EventsService);

  return eventsService.getEventById(eventId).pipe(
    map((event) => {
      if (!event) {
        return router.createUrlTree(['/']);
      }

      if (user.email !== event.owner) {
        return router.createUrlTree([eventId]);
      }

      return true;
    }),
  );
};
