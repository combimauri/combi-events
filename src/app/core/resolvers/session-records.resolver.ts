import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SessionRecord } from '@core/models';
import { AuthService, SessionRecordsService } from '@core/services';
import { EventState, SessionRecordsState } from '@core/states';
import { of, switchMap, tap } from 'rxjs';

export const sessionRecordsResolver: ResolveFn<
  SessionRecord[] | undefined
> = () => {
  const sessionRecordsState = inject(SessionRecordsState);
  const sessionRecordsService = inject(SessionRecordsService);
  const eventState = inject(EventState);
  const eventId = eventState.event()!.id;
  const user$ = inject(AuthService).user$;

  return user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(undefined);
      }

      return sessionRecordsService.getRecordsByEventIdAndEmail(
        eventId,
        user?.email!,
      );
    }),
    tap((sessionRecords) =>
      saveSessionRecordsState(sessionRecordsState, sessionRecords),
    ),
  );
};

const saveSessionRecordsState = (
  sessionRecordState: SessionRecordsState,
  sessionRecords?: SessionRecord[],
) => {
  if (sessionRecords) {
    sessionRecordState.setUserSessions(sessionRecords);
  } else {
    sessionRecordState.setUserSessions([]);
  }
};
