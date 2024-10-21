import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AppEvent } from '@core/models';
import { EventsService } from '@core/services';

export const eventsResolver: ResolveFn<AppEvent | undefined> = (route) => {
  const eventId = route.params['id'];
  const eventsService = inject(EventsService);

  return eventsService.getEventById(eventId);
};
