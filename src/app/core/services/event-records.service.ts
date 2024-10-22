import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  DocumentData,
  endBefore,
  Firestore,
  getCountFromServer,
  getDoc,
  limit,
  limitToLast,
  orderBy,
  Query,
  query,
  setDoc,
  startAfter,
  Timestamp,
  where,
} from '@angular/fire/firestore';
import {
  EventRecord,
  EventRecordListing,
  PartialEventRecord,
} from '@core/models';
import { EventRecordState } from '@core/states';
import { loadEffect, handleError } from '@core/utils';
import { catchError, from, map, Observable, switchMap, take, tap } from 'rxjs';
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

  getFirstPageOfRecordsByEventId(
    eventId: string,
    pageSize: number,
    filters?: Record<string, unknown>,
  ): Observable<EventRecordListing | undefined> {
    const recordsCollection = query(
      collection(this.#firestore, this.#collectionName),
    );
    let recordsQuery = query(recordsCollection);
    recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
    recordsQuery = query(
      recordsQuery,
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    );

    return (collectionData(recordsQuery) as Observable<EventRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(eventId, filters).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getNextPageOfRecordsByEventId(
    eventId: string,
    lastVisibleRecordId: string,
    pageSize: number,
    filters?: Record<string, unknown>,
  ): Observable<EventRecordListing | undefined> {
    const recordsRef = collection(this.#firestore, this.#collectionName);
    const lastDoc = from(getDoc(doc(recordsRef, lastVisibleRecordId)));

    return lastDoc.pipe(
      tap(this.#loadEffectObserver),
      switchMap((docSnapshot) => {
        const recordsCollection = query(recordsRef);
        let recordsQuery = query(recordsCollection);
        recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
        recordsQuery = query(
          recordsQuery,
          where('eventId', '==', eventId),
          orderBy('createdAt', 'desc'),
          startAfter(docSnapshot),
          limit(pageSize),
        );

        return collectionData(recordsQuery) as Observable<EventRecord[]>;
      }),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(eventId, filters).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getPreviousPageOfRecordsByEventId(
    eventId: string,
    firstVisibleRecordId: string,
    pageSize: number,
    filters?: Record<string, unknown>,
  ): Observable<EventRecordListing | undefined> {
    const recordsRef = collection(this.#firestore, this.#collectionName);
    const firstDoc = from(getDoc(doc(recordsRef, firstVisibleRecordId)));

    return firstDoc.pipe(
      tap(this.#loadEffectObserver),
      switchMap((docSnapshot) => {
        const recordsCollection = query(recordsRef);
        let recordsQuery = query(recordsCollection);
        recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
        recordsQuery = query(
          recordsQuery,
          where('eventId', '==', eventId),
          orderBy('createdAt', 'desc'),
          endBefore(docSnapshot),
          limitToLast(pageSize),
        );

        return collectionData(recordsQuery) as Observable<EventRecord[]>;
      }),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(eventId, filters).pipe(
          map((total) => ({ items, total })),
        ),
      ),
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
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    return this.upsertRecord({
      ...eventRecord,
      id: crypto.randomUUID(),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
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

  private getRecordsCount(
    eventId: string,
    filters?: Record<string, unknown>,
  ): Observable<number> {
    const recordsCollection = query(
      collection(this.#firestore, this.#collectionName),
    );
    let recordsQuery = query(
      recordsCollection,
      where('eventId', '==', eventId),
    );
    recordsQuery = this.addFiltersToQuery(recordsQuery, filters);

    return from(getCountFromServer(recordsQuery)).pipe(
      map((snapshot) => snapshot.data().count),
    );
  }

  private addFiltersToQuery(
    dbQuery: Query<DocumentData>,
    filters?: Record<string, unknown>,
  ): Query<DocumentData> {
    if (!filters) {
      return dbQuery;
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null) {
        dbQuery = query(dbQuery, where(key, '==', value));
      }
    }

    return dbQuery;
  }
}
