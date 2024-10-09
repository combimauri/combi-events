import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { EventRecord, PartialEventRecord } from '../models/event-record.model';

@Injectable({
  providedIn: 'root',
})
export class EventRecordsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'event-records';

  getRecordById(id: string): Observable<EventRecord | undefined> {
    const recordRef = doc(this.#firestore, this.#collectionName, id);

    return collectionData<EventRecord>(recordRef) as Observable<EventRecord>;
  }

  getRecords(eventId: string): Observable<EventRecord[]> {
    const recordsCollection = collection(this.#firestore, this.#collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('eventId', '==', eventId),
    );

    return collectionData(recordsQuery) as Observable<EventRecord[]>;
  }

  registerRecord(eventRecord: PartialEventRecord): Observable<EventRecord> {
    const record: EventRecord = {
      ...eventRecord,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      validated: false,
    };

    return this.upsertRecord(record);
  }

  validateRecord(eventRecord: EventRecord): Observable<EventRecord> {
    const record: EventRecord = {
      ...eventRecord,
      updatedAt: new Date(),
      validated: true,
    };

    return this.upsertRecord(record);
  }

  private upsertRecord(eventRecord: EventRecord): Observable<EventRecord> {
    const recordRef = doc(
      this.#firestore,
      this.#collectionName,
      eventRecord.id,
    );

    return from(setDoc(recordRef, eventRecord)).pipe(map(() => eventRecord));
  }
}
