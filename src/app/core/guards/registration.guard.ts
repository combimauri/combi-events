import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EventRecord } from '@core/models';
import {
  AuthService,
  EventRecordsService,
  EventsService,
} from '@core/services';
import { EventRecordState } from '@core/states';
import { combineLatest, map, switchMap } from 'rxjs';

export const registrationGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const eventId = route.parent?.params['id'];

  if (!eventId) {
    return router.createUrlTree(['/']);
  }

  const user$ = inject(AuthService).user$;
  const eventRecordsService = inject(EventRecordsService);
  const eventRecordState = inject(EventRecordState);
  const eventsService = inject(EventsService);
  const records$ = user$.pipe(
    switchMap((user) =>
      eventRecordsService.getRecordsByEventIdAndEmail(
        eventId,
        user?.email || '',
      ),
    ),
  );
  const data$ = combineLatest([eventsService.getEventById(eventId), records$]);

  return data$.pipe(
    map(([event, eventRecords]) => {
      if (!event) {
        return router.createUrlTree(['/']);
      }

      if (!event.openRegistration) {
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
