import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { EventRecordsService } from '../services/event-records.service';
import { UserState } from '../states/user.state';
import { EventRecordState } from '../states/event-record.state';

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

  return eventRecordsService
    .getRecordsByEventIdAndEmail(eventId, user.email!)
    .pipe(
      map((eventRecords) => {
        if (!eventRecords || eventRecords?.length === 0) {
          eventRecordState.clearEventRecord();

          return true;
        }

        const eventRecord = eventRecords[0];

        if (eventRecord.validated) {
          return router.createUrlTree(['events', eventId]);
        }

        eventRecordState.setEventRecord(eventRecord);

        return true;
      }),
    );
};
