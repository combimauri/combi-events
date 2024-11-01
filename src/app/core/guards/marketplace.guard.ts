import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { EventRecord } from '@core/models';
import { EventRecordsService, AuthService } from '@core/services';
import { EventState, EventRecordState } from '@core/states';
import { switchMap, map } from 'rxjs';

export const marketplaceGuard: CanActivateFn = (route, state) => {
  const event = inject(EventState).event()!;
  const router = inject(Router);

  if (!event.openMarketplace) {
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
      if (eventRecord) {
        eventRecordState.setEventRecord(eventRecord);

        return validateExistingRecord(eventRecord, router);
      }

      eventRecordState.clearEventRecord();

      return false;
    }),
  );
};

const validateExistingRecord = (
  eventRecord: EventRecord,
  router: Router,
): UrlTree | boolean => {
  if (!eventRecord.validated) {
    return router.createUrlTree([eventRecord.eventId]);
  }

  return true;
};
