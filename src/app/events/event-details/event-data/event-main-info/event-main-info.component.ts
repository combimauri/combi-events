import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Event } from '../../../../core/models/event.model';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'combi-event-main-info',
  standalone: true,
  imports: [BackButtonComponent, DatePipe, MatCardModule],
  template: `
    <mat-card>
      <mat-card-content class="page-title">
        <combi-back-button />
        <h6>{{ event().name }}</h6>
      </mat-card-content>
    </mat-card>

    <mat-card>
      <mat-card-content>
        <div>
          <p>{{ event().description }}</p>
          <p>
            <b>Fecha:</b>
            {{ event().date.start.toDate() | date: 'd MMM, HH:mm' }}
          </p>
          <p><b>Lugar:</b> {{ event().location.name }}</p>
          <p>
            <b>Costo:</b>
            @if (event().price.amount) {
              <span
                [class.event-main-info__line-through]="event().price.discount"
              >
                {{ event().price.amount }}
              </span>
              @if (event().price.discount) {
                <span>
                  {{ event().price.amount - event().price.discount }}
                </span>
              }
              {{ event().price.currency }}
            } @else {
              Gratis
            }
          </p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-main-info__line-through {
      margin: 0 0.5rem;
      text-decoration: line-through;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventMainInfoComponent {
  readonly event = input.required<Event>();
}
