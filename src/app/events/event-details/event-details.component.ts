import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventRecordState, EventState } from '@core/states';

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
        [hidden]="!bannerLoaded()"
        (load)="bannerLoaded.set(true)"
      />

      @if (!bannerLoaded()) {
        <div class="event-details__banner-skeleton"></div>
      }

      <router-outlet />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .event-details__banner {
      border-radius: 0.75rem;
      max-height: 360px;
      object-fit: cover;
      width: 100%;
    }

    .event-details__banner-skeleton {
      animation: skeleton-loading 1s linear infinite alternate;
      aspect-ratio: 3 / 1;
      background-color: #636363;
      border-radius: 0.75rem;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventDetailsComponent implements OnDestroy {
  readonly #eventState = inject(EventState);
  readonly #eventRecordState = inject(EventRecordState);

  protected readonly event = this.#eventState.event;
  protected readonly bannerLoaded = signal(false);

  ngOnDestroy(): void {
    this.#eventState.clearEvent();
    this.#eventRecordState.clearEventRecord();
  }
}
