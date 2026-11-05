import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService, EventsService } from '@core/services';
import { PageTitleComponent } from '@shared/components';
import { map, of, switchMap } from 'rxjs';

@Component({
  selector: 'combi-admin-events',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    PageTitleComponent,
    RouterLink,
  ],
  template: `
    <div class="admin-events__header">
      <combi-page-title [selfHandle]="false" (goBack)="goHome()">
        Administrar eventos
      </combi-page-title>
      <a mat-flat-button routerLink="events/new">
        <mat-icon aria-hidden="true" fontIcon="add" />
        Crear evento
      </a>
    </div>

    <section class="admin-events__list" aria-labelledby="owned-events-title">
      <h2 id="owned-events-title" class="admin-events__subtitle">
        Eventos de los que eres propietario
      </h2>

      @let ownedEvents = events();

      @if (ownedEvents === undefined) {
        <p class="admin-events__empty">Cargando eventos…</p>
      } @else {
        @for (event of ownedEvents; track event.id) {
          <mat-card appearance="outlined" class="admin-event">
            <img
              class="admin-event__image"
              alt=""
              loading="lazy"
              [src]="event.image || event.bannerImage"
            />
            <div class="admin-event__body">
              <h3 class="admin-event__name">{{ event.name }}</h3>
              <p class="admin-event__meta">
                <mat-icon aria-hidden="true" fontIcon="event" />
                {{ event.date.start.toDate() | date: 'd MMM yyyy, HH:mm' }}
              </p>
              <p class="admin-event__meta">
                <mat-icon aria-hidden="true" fontIcon="groups" />
                {{ event.count }} / {{ event.capacity }} registrados
              </p>
              <div class="admin-event__chips">
                <span
                  class="admin-event__chip"
                  [class.admin-event__chip--on]="event.openRegistration"
                >
                  {{
                    event.openRegistration
                      ? 'Registro abierto'
                      : 'Registro cerrado'
                  }}
                </span>
                <span
                  class="admin-event__chip"
                  [class.admin-event__chip--on]="event.listEvent"
                >
                  {{ event.listEvent ? 'Público' : 'Oculto' }}
                </span>
              </div>
            </div>
            <div class="admin-event__actions">
              <a mat-stroked-button [routerLink]="['/', event.id]">
                <mat-icon aria-hidden="true" fontIcon="visibility" />
                Ver
              </a>
              <a mat-stroked-button [routerLink]="['events', event.id, 'edit']">
                <mat-icon aria-hidden="true" fontIcon="edit" />
                Editar
              </a>
              <a mat-flat-button [routerLink]="['events', event.id]">
                <mat-icon aria-hidden="true" fontIcon="admin_panel_settings" />
                Gestionar
              </a>
            </div>
          </mat-card>
        } @empty {
          <p class="admin-events__empty">
            Todavía no tienes eventos. ¡Crea el primero!
          </p>
        }
      }
    </section>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .admin-events__header {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      justify-content: space-between;
    }

    .admin-events__list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .admin-events__subtitle {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .admin-events__empty {
      color: var(--ce-text-muted);
      margin: 0;
    }

    .admin-event {
      align-items: center;
      display: grid;
      gap: 1rem;
      grid-template-columns: 96px 1fr;
      padding: 1rem;

      @media (min-width: 720px) {
        grid-template-columns: 112px 1fr auto;
      }
    }

    .admin-event__image {
      aspect-ratio: 1;
      border-radius: var(--ce-radius-md);
      object-fit: cover;
      width: 100%;
    }

    .admin-event__body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .admin-event__name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .admin-event__meta {
      align-items: center;
      color: var(--ce-text-secondary);
      display: flex;
      font-size: 0.875rem;
      gap: 0.375rem;
      margin: 0;

      mat-icon {
        font-size: 1.125rem;
        height: 1.125rem;
        width: 1.125rem;
      }
    }

    .admin-event__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-top: 0.25rem;
    }

    .admin-event__chip {
      border: 1px solid var(--ce-border-strong);
      border-radius: 999px;
      color: var(--ce-text-muted);
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
    }

    .admin-event__chip--on {
      background: var(--ce-accent-soft);
      border-color: transparent;
      color: var(--ce-accent);
    }

    .admin-event__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      grid-column: 1 / -1;
      justify-content: flex-end;

      @media (min-width: 720px) {
        flex-direction: column;
        grid-column: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminEventsComponent {
  readonly #eventsService = inject(EventsService);
  readonly #router = inject(Router);

  // `undefined` while loading; an empty array once loaded with no events.
  readonly events = toSignal(
    inject(AuthService).user$.pipe(
      switchMap((user) =>
        user?.email
          ? this.#eventsService
              .getEventsByOwner(user.email)
              .pipe(map((events) => events ?? []))
          : of([]),
      ),
    ),
  );

  goHome(): void {
    this.#router.navigate(['/']);
  }
}
