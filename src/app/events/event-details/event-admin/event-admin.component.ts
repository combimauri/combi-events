import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BackButtonComponent } from '@shared/components';
import { EventState } from '@core/states';
import { EventRecordsTableComponent } from './event-records-table/event-records-table.component';

@Component({
  selector: 'combi-event-admin',
  standalone: true,
  imports: [BackButtonComponent, EventRecordsTableComponent, MatCardModule],
  template: `
    @if (event(); as event) {
      <mat-card appearance="outlined">
        <mat-card-content class="page-title">
          <combi-back-button />
          <h4>Gestionar {{ event.name }}</h4>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-content>
          <combi-event-records-table
            [additionalQuestions]="event.registrationAdditionalQuestions"
            [eventId]="event.id"
            [eventName]="event.name"
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
  readonly event = inject(EventState).event;
}
