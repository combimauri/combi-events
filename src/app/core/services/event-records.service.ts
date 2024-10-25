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
  startAfter,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Sort } from '@angular/material/sort';
import {
  BillingData,
  BillingRecord,
  EventRecord,
  EventRecordListing,
} from '@core/models';
import { loadEffect, handleError } from '@core/utils';
import { catchError, from, map, Observable, switchMap, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class EventRecordsService {
  readonly #collectionName = 'event-records';
  readonly #firestore = inject(Firestore);
  readonly #functions = inject(Functions);
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

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

  getRecordByEventIdAndEmail(
    eventId: string,
    email: string,
  ): Observable<EventRecord | undefined> {
    const recordsCollection = collection(this.#firestore, this.#collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('eventId', '==', eventId),
      where('email', '==', email),
      limit(1),
    );

    return (collectionData(recordsQuery) as Observable<EventRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      map((records) => records[0]),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getFirstPageOfRecordsByEventId(
    eventId: string,
    pageSize: number,
    { active, direction }: Sort,
    searchTerm: string,
    filters?: Record<string, unknown>,
  ): Observable<EventRecordListing | undefined> {
    const directionToSort = direction === 'asc' ? 'asc' : 'desc';
    const recordsCollection = query(
      collection(this.#firestore, this.#collectionName),
    );
    let recordsQuery = query(recordsCollection);
    recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
    recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);
    recordsQuery = query(
      recordsQuery,
      where('eventId', '==', eventId),
      orderBy(active, directionToSort),
      limit(pageSize),
    );

    return (collectionData(recordsQuery) as Observable<EventRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(eventId, searchTerm, filters).pipe(
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
    { active, direction }: Sort,
    searchTerm: string,
    filters?: Record<string, unknown>,
  ): Observable<EventRecordListing | undefined> {
    const directionToSort = direction === 'asc' ? 'asc' : 'desc';
    const recordsRef = collection(this.#firestore, this.#collectionName);
    const lastDoc = from(getDoc(doc(recordsRef, lastVisibleRecordId)));

    return lastDoc.pipe(
      tap(this.#loadEffectObserver),
      switchMap((docSnapshot) => {
        const recordsCollection = query(recordsRef);
        let recordsQuery = query(recordsCollection);
        recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
        recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);
        recordsQuery = query(
          recordsQuery,
          where('eventId', '==', eventId),
          orderBy(active, directionToSort),
          startAfter(docSnapshot),
          limit(pageSize),
        );

        return collectionData(recordsQuery) as Observable<EventRecord[]>;
      }),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(eventId, searchTerm, filters).pipe(
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
    { active, direction }: Sort,
    searchTerm: string,
    filters?: Record<string, unknown>,
  ): Observable<EventRecordListing | undefined> {
    const directionToSort = direction === 'asc' ? 'asc' : 'desc';
    const recordsRef = collection(this.#firestore, this.#collectionName);
    const firstDoc = from(getDoc(doc(recordsRef, firstVisibleRecordId)));

    return firstDoc.pipe(
      tap(this.#loadEffectObserver),
      switchMap((docSnapshot) => {
        const recordsCollection = query(recordsRef);
        let recordsQuery = query(recordsCollection);
        recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
        recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);
        recordsQuery = query(
          recordsQuery,
          where('eventId', '==', eventId),
          orderBy(active, directionToSort),
          endBefore(docSnapshot),
          limitToLast(pageSize),
        );

        return collectionData(recordsQuery) as Observable<EventRecord[]>;
      }),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(eventId, searchTerm, filters).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  registerRecord(
    eventId: string,
    { additionalAnswers, fullName, phoneNumber, couponId }: BillingRecord,
  ): Observable<BillingData | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createOrder',
    )({ eventId, fullName, phoneNumber, additionalAnswers, couponId });

    return from(response).pipe(
      tap(this.#loadEffectObserver),
      map((result) => result.data as BillingData),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  private addSearchTermToQuery(
    dbQuery: Query<DocumentData>,
    searchTerm: string,
  ): Query<DocumentData> {
    if (!searchTerm) {
      return dbQuery;
    }

    return query(
      dbQuery,
      where('searchTerm', '>=', searchTerm),
      where('searchTerm', '<=', searchTerm + '\uf8ff'),
    );
  }

  private getRecordsCount(
    eventId: string,
    searchTerm: string,
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
    recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);

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
