import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { EventRecord } from '../models/event-record.model';
import { EventRecordsService } from '../services/event-records.service';
import { EventsService } from '../services/events.service';
import { EventRecordState } from '../states/event-record.state';
import { UserState } from '../states/user.state';

export const registrationGuard: CanActivateFn = (route, _state) => {
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

  const eventRecordsService = inject(EventRecordsService);
  const eventRecordState = inject(EventRecordState);
  const eventsService = inject(EventsService);
  const data$ = combineLatest([
    eventsService.getEventById(eventId),
    eventRecordsService.getRecordsByEventIdAndEmail(eventId, user.email!),
  ]);

  return data$.pipe(
    map(([event, eventRecords]) => {
      if (!event) {
        return router.createUrlTree(['/']);
      }

      if (!event.openRegistration) {
        if (event.betaAccess?.includes(user.email!)) {
          return validateEventRecord(
            eventRecordState,
            eventId,
            eventRecords,
            router,
          );
        }

        return router.createUrlTree([eventId]);
      }

      return validateEventRecord(
        eventRecordState,
        eventId,
        eventRecords,
        router,
      );
    }),
  );
};

const validateEventRecord = (
  eventRecordState: EventRecordState,
  eventId: string,
  eventRecords: EventRecord[] | undefined,
  router: Router,
) => {
  if (!eventRecords || eventRecords?.length === 0) {
    eventRecordState.clearEventRecord();

    return true;
  }

  // There should be only one record per user, but this is a safety check
  if (eventRecords.some((record) => record.validated)) {
    return router.createUrlTree([eventId]);
  }

  eventRecordState.setEventRecord(eventRecords[0]);

  return true;
};
