import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppEvent } from '@core/models';
import { EventsService } from '@core/services';
import { EventState } from '@core/states';
import { map, tap } from 'rxjs';

export const eventGuard: CanActivateFn = (route) => {
  const eventId = route.params['id'];
  const eventsService = inject(EventsService);
  const eventState = inject(EventState);
  const router = inject(Router);

  return eventsService.getEventById(eventId).pipe(
    tap((event) => saveEventState(eventState, event)),
    map((event) => {
      if (event) {
        return true;
      }

      return router.createUrlTree(['/']);
    }),
  );
};

const saveEventState = (eventState: EventState, event?: AppEvent) => {
  if (event) {
    eventState.setEvent(event);
  } else {
    eventState.clearEvent();
  }
};
