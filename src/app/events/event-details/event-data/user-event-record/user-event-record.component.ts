import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { EventRecord } from '../../../../core/models/event-record.model';
import { UserState } from '../../../../core/states/user.state';

@Component({
  selector: 'combi-user-event-record',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <h6>Registros</h6>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (eventRecord().validated) {
          <mat-card appearance="outlined">
            <mat-card-header>
              @let user = currentUser();

              @if (user) {
                <div
                  mat-card-avatar
                  [style.background-image]="'url(' + user.photoURL + ')'"
                  [style.background-size]="'cover'"
                ></div>
              }
              <mat-card-title> ¡Ya eres parte! </mat-card-title>
              <mat-card-subtitle>
                Nos vemos en el evento
                {{ user?.displayName }}
              </mat-card-subtitle>
            </mat-card-header>
          </mat-card>
        } @else {
          Estoy en construcción 🚧
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEventRecordComponent {
  readonly eventRecords = input.required<EventRecord[]>();
  // User is supposed to be registered only once per event
  readonly eventRecord = computed(() => this.eventRecords()[0]);
  readonly currentUser = inject(UserState).currentUser;
}
