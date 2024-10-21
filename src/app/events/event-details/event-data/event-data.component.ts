import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppEvent, EventRecord } from '@core/models';
import { AuthService, EventRecordsService } from '@core/services';
import { LoadingState } from '@core/states';
import {
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { EventLocationComponent } from './event-location/event-location.component';
import { EventMainInfoComponent } from './event-main-info/event-main-info.component';
import { UserEventRecordComponent } from './user-event-record/user-event-record.component';

@Component({
  selector: 'combi-event-data',
  standalone: true,
  imports: [
    DatePipe,
    EventLocationComponent,
    EventMainInfoComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    UserEventRecordComponent,
  ],
  template: `
    @if (event(); as event) {
      <combi-event-main-info [event]="event" />

      @if (user(); as user) {
        @if (user.email === event.owner) {
          <a mat-fab extended routerLink="admin">
            <mat-icon fontIcon="admin_panel_settings" />
            Gestionar Evento
          </a>
        } @else {
          @if (event.openRegistration) {
            @if (eventRecord(); as record) {
              <combi-user-event-record [eventRecord]="record" />
            } @else if (!loading()) {
              <a mat-fab extended routerLink="register">
                <mat-icon fontIcon="how_to_reg" />
                Registrarse
              </a>
            }
          } @else {
            <mat-card appearance="outlined">
              <mat-card-content>
                <p>El registro para este evento está cerrado.</p>
              </mat-card-content>
            </mat-card>
          }
        }
      } @else {
        <button mat-fab extended (click)="navigateToLogin()">
          <mat-icon fontIcon="login" />
          Iniciar Sesión y Registrarse
        </button>
      }

      <combi-event-location [event]="event" />
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
export default class EventDataComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #eventRecordService = inject(EventRecordsService);
  readonly #user$ = inject(AuthService).user$;

  readonly #event$ = this.#route.data.pipe(
    map((data) => data['event'] as AppEvent | undefined),
    shareReplay(),
  );
  readonly #eventRecords$ = combineLatest([this.#user$, this.#event$]).pipe(
    switchMap(([user, event]) => this.getRecords(user, event)),
  );

  readonly loading = inject(LoadingState).loading;
  readonly event = toSignal(this.#event$);
  readonly user = toSignal(this.#user$);

  readonly eventRecord = toSignal(
    this.#eventRecords$.pipe(
      map((records) => (records?.length ? records[0] : undefined)),
    ),
  );

  navigateToLogin(): void {
    const eventId = this.event()?.id!;
    const returnUrl = `/${eventId}/register`;

    this.#router.navigate(['/login'], {
      queryParams: { returnUrl },
    });
  }

  private getRecords(
    user: User | null,
    event: AppEvent | undefined,
  ): Observable<EventRecord[] | undefined> {
    if (!user || !event) {
      return of([]);
    }

    return this.#eventRecordService.getRecordsByEventIdAndEmail(
      event.id,
      user.email!,
    );
  }
}
