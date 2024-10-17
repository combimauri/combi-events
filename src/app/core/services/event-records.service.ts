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
import { EventRecord, PartialEventRecord } from '@core/models';
import { EventRecordState } from '@core/states';
import { loadEffect, handleError } from '@core/utils';
import { catchError, from, map, Observable, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class EventRecordsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'event-records';
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);
  readonly #eventRecordState = inject(EventRecordState);

  getRealtimeRecordById(id: string): Observable<EventRecord | undefined> {
    const recordRef = doc(this.#firestore, this.#collectionName, id);

    return (docData<EventRecord>(recordRef) as Observable<EventRecord>).pipe(
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getRecordById(id: string): Observable<EventRecord | undefined> {
    return this.getRealtimeRecordById(id).pipe(
      tap(this.#loadEffectObserver),
      take(1),
    );
  }

  getRecordsByEventId(eventId: string): Observable<EventRecord[] | undefined> {
    const recordsCollection = collection(this.#firestore, this.#collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('eventId', '==', eventId),
    );

    return (collectionData(recordsQuery) as Observable<EventRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getRecordsByEventIdAndEmail(
    eventId: string,
    email: string,
  ): Observable<EventRecord[] | undefined> {
    const recordsCollection = collection(this.#firestore, this.#collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('eventId', '==', eventId),
      where('email', '==', email),
    );

    return (collectionData(recordsQuery) as Observable<EventRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  registerRecord(
    eventRecord: PartialEventRecord,
  ): Observable<EventRecord | undefined> {
    const currentEventRecord = this.#eventRecordState.eventRecord();

    if (currentEventRecord) {
      return this.upsertRecord({
        ...currentEventRecord,
        ...eventRecord,
        updatedAt: new Date(),
      });
    }

    return this.upsertRecord({
      ...eventRecord,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      validated: false,
    });
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
