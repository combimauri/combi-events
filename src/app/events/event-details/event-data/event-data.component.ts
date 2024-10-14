import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { EventLocationComponent } from './event-location/event-location.component';
import { EventMainInfoComponent } from './event-main-info/event-main-info.component';
import { UserEventRecordComponent } from './user-event-record/user-event-record.component';
import { Event } from '../../../core/models/event.model';
import { EventRecord } from '../../../core/models/event-record.model';
import { EventRecordsService } from '../../../core/services/event-records.service';
import { UserState } from '../../../core/states/user.state';
import { LoadingState } from '../../../core/states/loading.state';

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
        <mat-card>
          <mat-card-content>
            <p>La inscripción para este evento está cerrada.</p>
          </mat-card-content>
        </mat-card>
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
  readonly #userState = inject(UserState);

  readonly loading = inject(LoadingState).loading;

  readonly #event$ = this.#route.data.pipe(
    map((data) => data['event'] as Event | undefined),
    shareReplay(),
  );
  readonly event = toSignal(this.#event$);

  readonly #eventRecords$ = this.#event$.pipe(
    switchMap((event) => this.getRecords(event)),
  );
  readonly eventRecord = toSignal(
    this.#eventRecords$.pipe(
      map((records) => (records?.length ? records[0] : undefined)),
    ),
  );

  private getRecords(
    event: Event | undefined,
  ): Observable<EventRecord[] | undefined> {
    const user = this.#userState.currentUser();

    if (!user || !event) {
      return of([]);
    }

    return this.#eventRecordService.getRecordsByEventIdAndEmail(
      event.id,
      user.email!,
    );
  }
}
