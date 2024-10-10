import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Event } from '../../../core/models/event.model';
import { SanitizeUrlPipe } from '../../../shared/pipes/sanitize-url.pipe';

@Component({
  selector: 'combi-event-data',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    SanitizeUrlPipe,
  ],
  template: `
    @if (event(); as event) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h5>
              {{ event.name }}
            </h5>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div>
            <p>{{ event.description }}</p>
            <p>
              <b>Fecha:</b>
              {{ event.date.start.toDate() | date: 'd MMM, HH:mm' }}
            </p>
            <p><b>Lugar:</b> {{ event.location.name }}</p>
            <p><b>Cupos:</b> {{ event.capacity }}</p>
            <p>
              <b>Costo:</b>
              @if (event.price.amount) {
                <span [class.event-data__line-through]="event.price.discount">
                  {{ event.price.amount }}
                </span>
                @if (event.price.discount) {
                  <span>
                    {{ event.price.amount - event.price.discount }}
                  </span>
                }
                {{ event.price.currency }}
              } @else {
                Gratis
              }
            </p>
          </div>
        </mat-card-content>
      </mat-card>

      <a mat-fab extended routerLink="register">
        <mat-icon>how_to_reg</mat-icon>
        Inscribirse
      </a>

      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h6>Ubicación</h6>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <iframe
            class="event-data__map"
            [src]="
              'https://maps.google.com/maps?q=' +
                event.location.geolocation.latitude +
                ',' +
                event.location.geolocation.longitude +
                '&hl=es&z=14&amp;output=embed' | sanitizeUrl
            "
          >
          </iframe>
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

    mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      @media (min-width: 960px) {
        flex-direction: row;
      }

      .event-data__line-through {
        margin-right: 0.5rem;
        text-decoration: line-through;
      }

      .event-data__map {
        border-radius: 0.75rem;
        border: 0;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        height: 300px;
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventDataComponent {
  #route = inject(ActivatedRoute);

  event = toSignal(
    this.#route.data.pipe(map((data) => data['event'] as Event | undefined)),
  );
}
