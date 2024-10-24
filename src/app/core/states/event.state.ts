import { computed, Injectable, signal } from '@angular/core';
import { AppEvent } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class EventState {
  readonly #event = signal<AppEvent | null>(null);

  readonly event = computed(() => this.#event());

  setEvent(event: AppEvent): void {
    this.#event.set(event);
  }

  clearEvent(): void {
    this.#event.set(null);
  }
}
