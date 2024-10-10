import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventCardComponent } from './event-card/event-card.component';
import { EventsService } from '../core/services/events.service';

@Component({
  selector: 'gdg-events',
  standalone: true,
  imports: [DatePipe, EventCardComponent],
  template: `
    <h3>Eventos</h3>
    @for (event of events(); track event.id) {
      <div class="events__item">
        <div class="events__date">
          <b>{{ event.date.start.toDate() | date: 'd MMM' }}</b>
          <span>{{ event.date.start.toDate() | date: 'HH:mm' }}</span>
        </div>
        <span class="events__line"></span>
        <gdg-event-card [event]="event"></gdg-event-card>
      </div>
    }
  `,
  styles: `
    .events__item {
      display: flex;

      .events__date {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        width: 54px;
      }

      .events__line {
        border-left: 2px dashed #e0e0e0;
        margin: 1rem 1rem 0;

        @media (min-width: 960px) {
          margin: 1rem 2rem 0;
        }

        &::before {
          background-color: #e0e0e0;
          border-radius: 50%;
          content: '';
          display: block;
          height: 10px;
          margin-left: -6px;
          width: 10px;
        }
      }

      gdg-event-card {
        flex-grow: 1;
      }
    }
  `,
})
export default class EventsComponent {
  #eventsService = inject(EventsService);

  events = toSignal(this.#eventsService.getEvents(), { initialValue: [] });
}
