import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'gdg-event-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="event-card" [routerLink]="event().id">
      <div class="event-card__data">
        <h3>{{ event().name }}</h3>
        <p class="event-card__item">
          <span class="material-symbols-outlined"> location_on </span>
          {{ event().location.name }}
        </p>
        <p class="event-card__item">
          <span class="material-symbols-outlined"> groups </span>
          {{ event().capacity }}
        </p>
      </div>
      <div>
        <img [alt]="event().name" [src]="event().image" />
      </div>
    </a>
  `,
  styles: `
    .event-card {
      display: flex;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.75rem;
      color: #000;
      padding: 0.75rem;
      text-decoration: none;

      .event-card__data {
        display: flex;
        flex: 1;
        flex-direction: column;

        .event-card__item {
          align-items: center;
          display: flex;
          gap: 10px;
        }
      }
    }
  `,
})
export class EventCardComponent {
  event = input.required<Event>();
}
