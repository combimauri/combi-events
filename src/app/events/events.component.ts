import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService, EventsService } from '@core/services';
import { TimelineItemComponent } from '@shared/components';
import { of, switchMap } from 'rxjs';
import { EventCardComponent } from './event-card/event-card.component';

@Component({
  selector: 'combi-events',
  standalone: true,
  imports: [EventCardComponent, TimelineItemComponent],
  template: `
    @let ownerEvents = userEvents();
    @if (ownerEvents && ownerEvents.length > 0) {
      <h1>Tus Eventos</h1>
      @for (event of ownerEvents; track event.id) {
        <combi-timeline-item [date]="event.date.start.toDate()">
          <combi-event-card [event]="event" />
        </combi-timeline-item>
      }
    }
    <hr />
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
  readonly #user$ = inject(AuthService).user$;

  readonly events = toSignal(this.#eventsService.getEvents(), {
    initialValue: [],
  });
  readonly userEvents = toSignal(
    this.#user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }

        return this.#eventsService.getEventsByOwner(user.email!);
      }),
    ),
    { initialValue: [] },
  );
}
