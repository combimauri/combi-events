import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Session, SessionRecord } from '@core/models';
import {
  LoggerService,
  SessionRecordsService,
  SessionsService,
} from '@core/services';
import { EventState, SessionRecordsState } from '@core/states';
import { PageTitleComponent, TimelineItemComponent } from '@shared/components';
import { of, Subject, switchMap, tap } from 'rxjs';
import { SessionCardComponent } from './session-card/session-card.component';

@Component({
  selector: 'combi-event-sessions',
  standalone: true,
  imports: [PageTitleComponent, SessionCardComponent, TimelineItemComponent],
  template: `
    <combi-page-title> Talleres {{ event()?.name }} </combi-page-title>

    @for (session of mappedSessions(); track session.id) {
      <combi-timeline-item [date]="session.date.start.toDate()">
        <combi-session-card
          [session]="session"
          (register)="registerToSession$.next($event)"
          (unregister)="unregisterToSession$.next($event)"
        />
      </combi-timeline-item>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventSessionsComponent {
  readonly #logger = inject(LoggerService);
  readonly #sessionsService = inject(SessionsService);
  readonly #sessionRecordsService = inject(SessionRecordsService);
  readonly #sessionRecordsState = inject(SessionRecordsState);

  readonly event = inject(EventState).event;
  readonly #event$ = toObservable(this.event);
  readonly #eventSessions$ = this.#event$.pipe(
    switchMap((event) => {
      if (!event) {
        return of([]);
      }

      return this.#sessionsService.getRealtimeSessionsByEventId(event.id);
    }),
  );
  readonly #eventSessions = toSignal(this.#eventSessions$, {
    initialValue: [],
  });

  readonly mappedSessions = computed(() =>
    this.mapSessions(
      this.#sessionRecordsState.userSessions(),
      this.#eventSessions(),
    ),
  );
  readonly registerToSession$ = new Subject<string>();
  readonly registeredSession = toSignal(
    this.registerToSession$.pipe(
      switchMap((sessionId) =>
        this.#sessionRecordsService.registerRecord(sessionId),
      ),
      tap((record) => this.handleRegisterResponse(record)),
    ),
  );
  readonly unregisterToSession$ = new Subject<string>();
  readonly unregisteredSession = toSignal(
    this.unregisterToSession$.pipe(
      switchMap((sessionId) =>
        this.#sessionRecordsService.unregisterRecord(sessionId),
      ),
      tap((record) => this.handleUnregisterResponse(record)),
    ),
  );

  private mapSessions(
    userSessions: SessionRecord[],
    eventSessions?: Session[],
  ): Session[] {
    if (!eventSessions) {
      return [];
    }

    return eventSessions.map((session) => {
      const userSession = userSessions.find(
        (userSession) => userSession.sessionId === session.id,
      );

      return {
        ...session,
        isRegistered: !!userSession,
      };
    });
  }

  private handleRegisterResponse(record: SessionRecord | undefined): void {
    if (record) {
      this.#sessionRecordsState.addUserSession(record);
      this.#logger.handleSuccess('¡Registro exitoso!');
    }
  }

  private handleUnregisterResponse(record: SessionRecord | undefined): void {
    if (record) {
      this.#sessionRecordsState.removeUserSession(record.id);
      this.#logger.handleSuccess('¡Se eliminó el registro con éxito!');
    }
  }
}
