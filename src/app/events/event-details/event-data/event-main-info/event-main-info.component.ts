import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AppEvent } from '@core/models';
import { PageTitleComponent } from '@shared/components';

@Component({
  selector: 'combi-event-main-info',
  standalone: true,
  imports: [DatePipe, MatCardModule, PageTitleComponent],
  template: `
    <combi-page-title> {{ event().name }} </combi-page-title>

    <mat-card appearance="outlined">
      <mat-card-content>
        <div>
          <p [innerHTML]="event().description"></p>
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
  readonly event = input.required<AppEvent>();
}
