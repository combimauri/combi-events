import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventsService } from '@core/services';
import { EventCardComponent } from './event-card/event-card.component';

@Component({
  selector: 'combi-events',
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
        <combi-event-card [event]="event"></combi-event-card>
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

      combi-event-card {
        flex-grow: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventsComponent {
  readonly #eventsService = inject(EventsService);

  readonly events = toSignal(this.#eventsService.getEvents(), { initialValue: [] });
}
