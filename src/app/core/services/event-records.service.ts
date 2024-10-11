import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';
import { EventRecord, PartialEventRecord } from '../models/event-record.model';
import { handleError } from '../utils/handle-error.utils';
import { loadEffect } from '../utils/load-effect.utils';

@Injectable({
  providedIn: 'root',
})
export class EventRecordsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'event-records';
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getRealtimeRecordById(id: string): Observable<EventRecord | undefined> {
    const recordRef = doc(this.#firestore, this.#collectionName, id);

    return (docData<EventRecord>(recordRef) as Observable<EventRecord>).pipe(
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getRecords(eventId: string): Observable<EventRecord[] | undefined> {
    const recordsCollection = collection(this.#firestore, this.#collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('eventId', '==', eventId),
    );

    return (collectionData(recordsQuery) as Observable<EventRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  registerRecord(
    eventRecord: PartialEventRecord,
  ): Observable<EventRecord | undefined> {
    const record: EventRecord = {
      ...eventRecord,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      validated: false,
    };

    return this.upsertRecord(record);
  }

  private upsertRecord(
    eventRecord: EventRecord,
  ): Observable<EventRecord | undefined> {
    const recordRef = doc(
      this.#firestore,
      this.#collectionName,
      eventRecord.id,
    );

    return from(setDoc(recordRef, eventRecord)).pipe(
      tap(this.#loadEffectObserver),
      map(() => eventRecord),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
