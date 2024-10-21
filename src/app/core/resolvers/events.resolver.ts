import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AppEvent } from '@core/models';
import { EventsService } from '@core/services';

export const eventsResolver: ResolveFn<AppEvent | undefined> = (route) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return undefined;
  }

  const eventId = route.params['id'];
  const eventsService = inject(EventsService);

  return eventsService.getEventById(eventId);
};
