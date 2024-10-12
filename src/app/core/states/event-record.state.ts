import { computed, Injectable, signal } from '@angular/core';
import { EventRecord } from '../models/event-record.model';

@Injectable({
  providedIn: 'root',
})
export class EventRecordState {
  #eventRecord = signal<EventRecord | null>(null);

  eventRecord = computed(() => this.#eventRecord());

  setEventRecord(eventRecord: EventRecord) {
    this.#eventRecord.set(eventRecord);
  }

  clearEventRecord() {
    this.#eventRecord.set(null);
  }
}
