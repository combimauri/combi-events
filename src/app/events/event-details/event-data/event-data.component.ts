import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppEvent, EventRecord } from '@core/models';
import { EventRecordsService } from '@core/services';
import { UserState, LoadingState } from '@core/states';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
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

      @if (currentUser()?.email === event.owner) {
        <a mat-fab extended routerLink="admin">
          <mat-icon>admin_panel_settings</mat-icon>
          Gestionar Evento
        </a>
      } @else {
        @if (event.openRegistration) {
          @if (eventRecord(); as record) {
            <combi-user-event-record [eventRecord]="record" />
          } @else if (!loading()) {
            <a mat-fab extended routerLink="register">
              <mat-icon>how_to_reg</mat-icon>
              Inscribirse
            </a>
          }
        } @else {
          <mat-card appearance="outlined">
            <mat-card-content>
              <p>La inscripción para este evento está cerrada.</p>
            </mat-card-content>
          </mat-card>
        }
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
  readonly #eventRecordService = inject(EventRecordsService);
  readonly #event$ = this.#route.data.pipe(
    map((data) => data['event'] as AppEvent | undefined),
    shareReplay(),
  );
  readonly #eventRecords$ = this.#event$.pipe(
    switchMap((event) => this.getRecords(event)),
  );

  readonly currentUser = inject(UserState).currentUser;
  readonly loading = inject(LoadingState).loading;
  readonly event = toSignal(this.#event$);
  readonly eventRecord = toSignal(
    this.#eventRecords$.pipe(
      map((records) => (records?.length ? records[0] : undefined)),
    ),
  );

  private getRecords(
    event: AppEvent | undefined,
  ): Observable<EventRecord[] | undefined> {
    if (!this.currentUser || !event) {
      return of([]);
    }

    return this.#eventRecordService.getRecordsByEventIdAndEmail(
      event.id,
      this.currentUser()?.email!,
    );
  }
}
