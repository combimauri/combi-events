import { computed, Injectable, signal } from '@angular/core';
import { EventRecord } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class EventRecordState {
  readonly #eventRecord = signal<EventRecord | null>(null);

  readonly eventRecord = computed(() => this.#eventRecord());

  setEventRecord(eventRecord: EventRecord): void {
    this.#eventRecord.set(eventRecord);
  }

  clearEventRecord(): void {
    this.#eventRecord.set(null);
  }
}
