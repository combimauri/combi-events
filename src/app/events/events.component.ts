import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventsService } from '@core/services';
import { TimelineItemComponent } from '@shared/components';
import { EventCardComponent } from './event-card/event-card.component';

@Component({
  selector: 'combi-events',
  standalone: true,
  imports: [EventCardComponent, TimelineItemComponent],
  template: `
    <h1>Eventos</h1>
    @for (event of events(); track event.id) {
      <combi-timeline-item [date]="event.date.start.toDate()">
        <combi-event-card [event]="event" />
      </combi-timeline-item>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      combi-event-card {
        flex-grow: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventsComponent {
  readonly #eventsService = inject(EventsService);

  readonly events = toSignal(this.#eventsService.getEvents(), {
    initialValue: [],
  });
}
