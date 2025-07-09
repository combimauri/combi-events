import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AppEvent } from '@core/models';
import { SanitizeUrlPipe } from '@shared/pipes';

@Component({
  selector: 'combi-event-location',
  standalone: true,
  imports: [MatCardModule, SanitizeUrlPipe],
  template: `
    @let geolocation = event().location.geolocation;
    @if (geolocation) {
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <h4>Ubicación</h4>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <iframe
            class="event-location"
            [src]="
              'https://maps.google.com/maps?q=' +
                geolocation.latitude +
                ',' +
                geolocation.longitude +
                '&hl=es&z=14&amp;output=embed' | sanitizeUrl
            "
          >
          </iframe>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    .event-location {
      border-radius: 0.75rem;
      border: 0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      height: 300px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLocationComponent {
  readonly event = input.required<AppEvent>();
}
