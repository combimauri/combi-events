import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventCardComponent } from './event-card/event-card.component';
import { EventsService } from '../core/services/events.service';

@Component({
  selector: 'gdg-events',
  standalone: true,
  imports: [EventCardComponent],
  template: `
    <div class="container">
      <h1>Eventos</h1>
      @for (event of events(); track event.id) {
        <gdg-event-card [event]="event"></gdg-event-card>
      }
    </div>
  `,
  styles: ``,
})
export default class EventsComponent {
  #eventsService = inject(EventsService);

  events = toSignal(this.#eventsService.getEvents(), { initialValue: [] });
}
