import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UsersService } from '@core/services';
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
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    PageTitleComponent,
    RouterLink,
  ],
  template: `
    @if (event(); as event) {
      <div class="event-admin__header">
        <combi-page-title [selfHandle]="false" (goBack)="goBack(event.id)">
          Gestionar {{ event.name }}
        </combi-page-title>
        <div class="event-admin__actions">
          <a mat-stroked-button [routerLink]="['/', event.id]">
            <mat-icon aria-hidden="true" fontIcon="visibility" />
            Ver evento
          </a>
          @if (canEdit()) {
            <a mat-flat-button routerLink="edit">
              <mat-icon aria-hidden="true" fontIcon="edit" />
              Editar evento
            </a>
          }
        </div>
      </div>

      <mat-card appearance="outlined">
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Registros">
              <combi-event-records-table
                [additionalQuestions]="event.additionalQuestions"
                [additionalRegistries]="event.registries"
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

    .event-admin__header {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      justify-content: space-between;
    }

    .event-admin__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventAdminComponent {
  readonly #router = inject(Router);
  readonly #isAdmin = toSignal(inject(UsersService).isAdmin$, {
    initialValue: false,
  });
  readonly #user = toSignal(inject(AuthService).user$);

  readonly event = inject(EventState).event;

  // Editing attributes is reserved to the owner holding the admin role;
  // co-admins (event.admins) can only manage registrations.
  canEdit(): boolean {
    return this.#isAdmin() && this.#user()?.email === this.event()?.owner;
  }

  goBack(eventId: string): void {
    // Co-admins without the admin role can't open /admin, so send them back
    // to the public event page instead.
    this.#router.navigate(this.#isAdmin() ? ['/admin'] : ['/', eventId]);
  }
}
