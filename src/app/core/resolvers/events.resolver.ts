import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Event } from '../models/event.model';
import { EventsService } from '../services/events.service';

export const eventsResolver: ResolveFn<Event | undefined> = (route) => {
  const eventId = route.params['id'];
  const eventsService = inject(EventsService);

  return eventsService.getEventById(eventId);
};
