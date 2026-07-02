import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
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
    <header class="events-header">
      <h1 class="events-header__title">Eventos</h1>
      <p class="events-header__subtitle">
        Encuentra y participa en los eventos de tecnología que más te interesan.
      </p>
    </header>
    @let ownerEvents = userEvents();
    @if (ownerEvents && ownerEvents.length > 0) {
      <section class="events-section" aria-labelledby="user-events-title">
        <h2 id="user-events-title" class="events-section__title">
          Tus Eventos
        </h2>
        @for (event of ownerEvents; track event.id) {
          <combi-timeline-item [date]="event.date.start.toDate()">
            <combi-event-card [event]="event" />
          </combi-timeline-item>
        }
      </section>
    }
    <section class="events-section" aria-labelledby="events-title">
      <h2 id="events-title" class="events-section__title">Próximos Eventos</h2>
      @for (event of upcomingEvents(); track event.id) {
        <combi-timeline-item [date]="event.date.start.toDate()">
          <combi-event-card [event]="event" />
        </combi-timeline-item>
      } @empty {
        <p class="events-section__empty">
          No hay eventos disponibles por ahora. ¡Vuelve pronto!
        </p>
      }
    </section>
    @if (pastEvents().length > 0) {
      <section class="events-section" aria-labelledby="past-events-title">
        <h2 id="past-events-title" class="events-section__title">
          Eventos Pasados
        </h2>
        @for (event of pastEvents(); track event.id) {
          <combi-timeline-item [date]="event.date.start.toDate()">
            <combi-event-card [event]="event" />
          </combi-timeline-item>
        }
      </section>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 2rem;

      combi-event-card {
        flex-grow: 1;
      }
    }

    .events-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .events-header__title {
      font-weight: 700;
      margin: 0;
    }

    .events-header__subtitle {
      color: var(--ce-text-secondary);
      margin: 0;
    }

    .events-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .events-section__title {
      font-weight: 600;
      margin: 0;
    }

    .events-section__empty {
      color: var(--ce-text-muted);
      margin: 0;
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
  // A past event is one whose end date falls on a day before today.
  readonly pastEvents = computed(() =>
    (this.events() ?? []).filter(
      (event) => event.date.end.toDate() < this.#startOfToday(),
    ),
  );
  readonly upcomingEvents = computed(() =>
    (this.events() ?? []).filter(
      (event) => event.date.end.toDate() >= this.#startOfToday(),
    ),
  );
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

  #startOfToday(): Date {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
  }
}
