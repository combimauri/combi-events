import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RegisterRecordError, SessionRecord } from '@core/models';
import {
  EventRecordsService,
  LoggerService,
  SessionRecordsService,
  SessionsService,
} from '@core/services';
import { EventState, SessionForScanState } from '@core/states';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { switchMap, of, Subject, skipWhile, filter, tap } from 'rxjs';

@Component({
  selector: 'combi-session-scanner',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    NgTemplateOutlet,
    ZXingScannerModule,
  ],
  template: `
    @if (eventSessions(); as sessions) {
      @if (selectedSession(); as session) {
        @switch (scanStatus()) {
          @case ('SCANNING') {
            <zxing-scanner (scanSuccess)="scannedId$.next($event)" />
          }
          @case ('SUCCESS') {
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title class="session-scanner__success-message">
                  {{ statusMessage() }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="session-scanner__image-container">
                  <img src="success.webp" alt="imagen de éxito" />
                </div>

                @if (scanEventRecord(); as sessionRecord) {
                  <p>
                    <b> Detalles del Registro </b>
                  </p>
                  <p><b>Correo Electrónico:</b> {{ sessionRecord.email }}</p>
                  <p><b>Nombre Completo:</b> {{ sessionRecord.fullName }}</p>
                }
              </mat-card-content>
            </mat-card>

            <ng-template *ngTemplateOutlet="scanAgainButton" />
          }
          @case ('ERROR') {
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title class="session-scanner__error-message">
                  {{ statusMessage() }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="session-scanner__image-container">
                  <img src="error.webp" alt="imagen de error" />
                </div>
              </mat-card-content>
            </mat-card>

            <ng-template *ngTemplateOutlet="scanAgainButton" />
          }
        }

        <ng-template #scanAgainButton>
          <button
            mat-fab
            extended
            type="button"
            class="session-scanner__scan-again-button"
            (click)="scanStatus.set('SCANNING')"
          >
            Volver a Escanear
          </button>
        </ng-template>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content class="session-scanner__sessions">
            @for (session of sessions; track session.id; let odd = $odd) {
              <button
                mat-flat-button
                [class.secondary-button]="odd"
                (click)="sessionForScanState.setSessionForScan(session)"
              >
                {{ session.name }}
              </button>
            }
          </mat-card-content>
        </mat-card>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .session-scanner__sessions {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      button {
        height: fit-content;
        padding: 0.5rem 1.5rem;
        width: 100%;
      }
    }

    .session-scanner__success-message {
      color: #4caf50;
    }

    .session-scanner__error-message {
      color: #b00020;
    }

    .session-scanner__image-container {
      display: flex;
      justify-content: center;
      padding-top: 1rem;

      img {
        max-width: 100%;
      }
    }

    .session-scanner__scan-again-button {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScannerComponent implements OnDestroy {
  readonly #logger = inject(LoggerService);
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #sessionsService = inject(SessionsService);
  readonly #sessionRecordsService = inject(SessionRecordsService);

  readonly sessionForScanState = inject(SessionForScanState);

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
  readonly eventSessions = toSignal(this.#eventSessions$);

  readonly selectedSession = this.sessionForScanState.sessionForScan;

  readonly statusMessage = signal<string>('');
  readonly scannedId$ = new Subject<string>();
  readonly scan$ = this.scannedId$.pipe(
    skipWhile(() => this.scanStatus() === 'PROCESSING'),
    filter((scannedId) => !!scannedId),
    switchMap((scannedId) => {
      this.scanStatus.set('PROCESSING');

      return this.#eventRecordsService.getRecordById(scannedId);
    }),
    switchMap((eventRecord) => {
      if (!eventRecord) {
        return of(RegisterRecordError.NoRecord);
      }

      return this.#sessionRecordsService.registerRecordEntry(
        this.selectedSession()!.id,
        eventRecord.email,
      );
    }),
    tap((response) => this.handleRegistrationResponse(response)),
  );
  readonly scanResult = toSignal(this.scan$);
  readonly scanEventRecord = computed(() =>
    this.setSessionRecord(this.scanResult()),
  );
  readonly scanStatus = signal<'SCANNING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>(
    'SCANNING',
  );

  ngOnDestroy(): void {
    this.sessionForScanState.clearSessionForScan();
  }

  private setSessionRecord(
    sessionRecord: SessionRecord | RegisterRecordError | undefined,
  ): SessionRecord | null {
    sessionRecord = sessionRecord as SessionRecord;

    if (sessionRecord?.id) {
      return sessionRecord;
    }

    return null;
  }

  private handleRegistrationResponse(
    response: SessionRecord | RegisterRecordError | undefined,
  ) {
    if ((response as SessionRecord).id) {
      this.scanStatus.set('SUCCESS');
      this.statusMessage.set('Entrada registrada.');
      this.#logger.handleSuccess(this.statusMessage());
    } else {
      this.scanStatus.set('ERROR');

      if (response) {
        if (RegisterRecordError.NoRecord === response) {
          this.statusMessage.set('No se encontró el registro.');
        } else if (RegisterRecordError.AlreadyRegistered === response) {
          this.statusMessage.set('El registro ya fue realizado.');
        }
      } else {
        this.statusMessage.set('Error registrando la entrada.');
      }

      this.#logger.handleError(this.statusMessage());
    }
  }
}
