import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { EventRecord } from '@core/models';
import { AuthService, EventRecordsService } from '@core/services';
import { EventRecordState, EventState } from '@core/states';
import { map, switchMap } from 'rxjs';

export const registrationGuard: CanActivateFn = () => {
  const event = inject(EventState).event()!;
  const router = inject(Router);

  if (!event.openRegistration) {
    return router.createUrlTree([event.id]);
  }

  const eventRecordState = inject(EventRecordState);
  const eventRecordsService = inject(EventRecordsService);
  const user$ = inject(AuthService).user$;
  const eventRecord = eventRecordState.eventRecord();

  if (eventRecord) {
    return validateExistingRecord(eventRecord, router);
  }

  return user$.pipe(
    switchMap((user) =>
      eventRecordsService.getRecordByEventIdAndEmail(event.id, user?.email!),
    ),
    map((eventRecord) => {
      if (!eventRecord) {
        eventRecordState.clearEventRecord();

        return true;
      }

      eventRecordState.setEventRecord(eventRecord);

      return validateExistingRecord(eventRecord, router);
    }),
  );
};

const validateExistingRecord = (
  eventRecord: EventRecord,
  router: Router,
): UrlTree | boolean => {
  if (eventRecord.validated) {
    return router.createUrlTree([eventRecord.eventId]);
  }

  return true;
};
