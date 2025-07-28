import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { EventState } from '@core/states';
import { PageTitleComponent } from '@shared/components';
import { EventProductsTableComponent } from './event-products-table/event-products-table.component';
import { EventRecordsTableComponent } from './event-records-table/event-records-table.component';
import { EventSessionsTableComponent } from './event-sessions-table/event-sessions-table.component';

@Component({
  selector: 'combi-event-admin',
  standalone: true,
  imports: [
    EventProductsTableComponent,
    EventRecordsTableComponent,
    EventSessionsTableComponent,
    MatCardModule,
    MatTabsModule,
    PageTitleComponent,
  ],
  template: `
    @if (event(); as event) {
      <combi-page-title> Gestionar {{ event.name }} </combi-page-title>

      <mat-card appearance="outlined">
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Registros">
              <combi-event-records-table
                [additionalQuestions]="event.additionalQuestions"
                [eventId]="event.id"
                [eventName]="event.name"
              />
            </mat-tab>
            <mat-tab label="Productos">
              <combi-event-products-table />
            </mat-tab>
            <mat-tab label="Sesiones">
              <combi-event-sessions-table />
            </mat-tab>
          </mat-tab-group>
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
