import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AppEvent } from '@core/models';
import { PageTitleComponent } from '@shared/components';

@Component({
  selector: 'combi-event-main-info',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatIconModule, PageTitleComponent],
  template: `
    <combi-page-title> {{ event().name }} </combi-page-title>

    <mat-card appearance="outlined">
      <mat-card-content>
        <div class="event-main-info__meta">
          <p class="event-main-info__meta-item">
            <mat-icon aria-hidden="true" fontIcon="calendar_today" />
            <span class="cdk-visually-hidden">Fecha:</span>
            {{ event().date.start.toDate() | date: 'd MMM, HH:mm' }}
          </p>
          <p class="event-main-info__meta-item">
            <mat-icon aria-hidden="true" fontIcon="location_on" />
            <span class="cdk-visually-hidden">Lugar:</span>
            {{ event().location.name }}
          </p>
          <p class="event-main-info__meta-item">
            <mat-icon aria-hidden="true" fontIcon="confirmation_number" />
            <span class="cdk-visually-hidden">Costo:</span>
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
        <p [innerHTML]="event().description"></p>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-main-info__meta {
      border-bottom: 1px solid var(--ce-border);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
    }

    .event-main-info__meta-item {
      align-items: center;
      color: var(--ce-text-secondary);
      display: flex;
      gap: 0.5rem;
      margin: 0;

      mat-icon {
        color: var(--ce-text-muted);
        flex-shrink: 0;
        font-size: 1.25rem;
        height: 1.25rem;
        width: 1.25rem;
      }
    }

    .event-main-info__line-through {
      text-decoration: line-through;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventMainInfoComponent {
  readonly event = input.required<AppEvent>();
}
