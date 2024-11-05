import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { EventState } from '@core/states';
import { PageTitleComponent } from '@shared/components';
import { EventRecordsTableComponent } from './event-records-table/event-records-table.component';

@Component({
  selector: 'combi-event-admin',
  standalone: true,
  imports: [EventRecordsTableComponent, MatCardModule, PageTitleComponent],
  template: `
    @if (event(); as event) {
      <combi-page-title> Gestionar {{ event.name }} </combi-page-title>

      <mat-card appearance="outlined">
        <mat-card-content>
          <combi-event-records-table
            [additionalQuestions]="event.additionalQuestions"
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
