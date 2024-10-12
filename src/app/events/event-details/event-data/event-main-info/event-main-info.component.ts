import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Event } from '../../../../core/models/event.model';

@Component({
  selector: 'combi-event-main-info',
  standalone: true,
  imports: [DatePipe, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <h5>
            {{ event().name }}
          </h5>
        </mat-card-title>
      </mat-card-header>
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
