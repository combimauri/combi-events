import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
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
      />

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
      height: auto;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventDetailsComponent implements OnDestroy {
  readonly #eventState = inject(EventState);
  readonly #eventRecordState = inject(EventRecordState);

  readonly event = this.#eventState.event;

  ngOnDestroy(): void {
    this.#eventState.clearEvent();
    this.#eventRecordState.clearEventRecord();
  }
}
