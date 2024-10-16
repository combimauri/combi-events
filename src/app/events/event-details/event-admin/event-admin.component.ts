import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { EventRecordsService } from '@core/services';
import { AppEvent, EventRecord } from '@core/models';
import { BackButtonComponent } from '@shared/components';
import { EventRecordsTableComponent } from './event-records-table/event-records-table.component';

@Component({
  selector: 'combi-event-admin',
  standalone: true,
  imports: [BackButtonComponent, EventRecordsTableComponent, MatCardModule],
  template: `
    @if (event(); as event) {
      <mat-card>
        <mat-card-content class="page-title">
          <combi-back-button />
          <h6>Gestionar {{ event.name }}</h6>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <combi-event-records-table
            [additionalQuestions]="event.registrationAdditionalQuestions"
            [eventRecordsObservable]="eventRecords$"
          />
        </mat-card-content>
      </mat-card>
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
export default class EventAdminComponent {
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #route = inject(ActivatedRoute);
  readonly #event$ = this.#route.parent!.data.pipe(
    map((data) => data['event'] as AppEvent | undefined),
  );

  readonly event = toSignal(this.#event$);
  readonly eventRecords$ = this.#event$.pipe(
    switchMap((event) => this.getEventRecords(event)),
  );

  private getEventRecords(event?: AppEvent): Observable<EventRecord[]> {
    if (!event) {
      return of([]);
    }

    return this.#eventRecordsService
      .getRecordsByEventId(event.id)
      .pipe(map((records) => records || []));
  }
}
