import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'combi-event-details',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @if (event(); as event) {
      <img
        class="event-details__banner"
        [alt]="event.name"
        [src]="event.bannerImage"
      />

      <router-outlet />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-details__banner {
      border-radius: 0.75rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      height: auto;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventDetailsComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  readonly event = toSignal(
    this.#route.data.pipe(map((data) => data['event'] as Event | undefined)),
  );

  constructor() {
    effect(() => this.handleLoadEvent(this.event()));
  }

  private handleLoadEvent(event: Event | undefined): void {
    if (!event) {
      this.#router.navigateByUrl('/');
    }
  }
}
