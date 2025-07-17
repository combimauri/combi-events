import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { EventRecord } from '@core/models';
import {
  AuthService,
  EventRecordsService,
  LoggerService,
} from '@core/services';
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
  const logger = inject(LoggerService);

  if (eventRecord) {
    return validateExistingRecord(eventRecord, router, logger);
  }

  return user$.pipe(
    switchMap((user) =>
      eventRecordsService.getRecordByEventIdAndEmail(event.id, user?.email!),
    ),
    map((eventRecord) => {
      if (eventRecord) {
        eventRecordState.setEventRecord(eventRecord);

        return validateExistingRecord(eventRecord, router, logger);
      }

      eventRecordState.clearEventRecord();

      return router.createUrlTree([event.id]);
    }),
  );
};

const validateExistingRecord = (
  eventRecord: EventRecord,
  router: Router,
  logger: LoggerService,
): UrlTree | boolean => {
  if (eventRecord.validated || eventRecord.paymentReceipts) {
    return true;
  }

  logger.handleError(
    'Debes completar tu registro para acceder al Marketplace.',
  );

  return router.createUrlTree([eventRecord.eventId]);
};
