import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EventRecord } from '@core/models';
import { AuthService, EventRecordsService } from '@core/services';
import { EventRecordState, EventState } from '@core/states';
import { of, switchMap, tap } from 'rxjs';

export const eventRecordResolver: ResolveFn<EventRecord | undefined> = () => {
  const eventRecordState = inject(EventRecordState);
  const eventRecord = eventRecordState.eventRecord();

  if (eventRecord) {
    return eventRecord;
  }

  const event = inject(EventState).event()!;
  const user$ = inject(AuthService).user$;
  const eventRecordsService = inject(EventRecordsService);

  return user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(undefined);
      }

      return eventRecordsService.getRecordByEventIdAndEmail(
        event.id,
        user?.email!,
      );
    }),
    tap((eventRecord) => saveEventRecordState(eventRecordState, eventRecord)),
  );
};

const saveEventRecordState = (
  eventRecordState: EventRecordState,
  eventRecord?: EventRecord,
) => {
  if (eventRecord) {
    eventRecordState.setEventRecord(eventRecord);
  } else {
    eventRecordState.clearEventRecord();
  }
};
