import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  limit,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { RegisterRecordError, SessionRecord } from '@core/models';
import { handleError } from '@core/utils';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TableRecordsService } from './table-records.service';

@Injectable({
  providedIn: 'root',
})
export class SessionRecordsService extends TableRecordsService<SessionRecord> {
  protected override collectionName = 'session-records';
  protected override idColumn = 'eventId';

  readonly #functions = inject(Functions);

  getRecordsByEventIdAndEmail(
    eventId: string,
    email: string,
  ): Observable<SessionRecord[] | undefined> {
    const recordsCollection = collection(this.firestore, this.collectionName);
    const recordsQuery = query(
      recordsCollection,
      where(this.idColumn, '==', eventId),
      where('email', '==', email),
    );

    return (collectionData(recordsQuery) as Observable<SessionRecord[]>).pipe(
      tap(this.loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  registerRecord(sessionId: string): Observable<SessionRecord | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createSessionOrder',
    )({
      sessionId,
    });

    return from(response).pipe(
      tap(this.loadEffectObserver),
      map((result) => result.data as SessionRecord),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  unregisterRecord(sessionId: string): Observable<SessionRecord | undefined> {
    const response = httpsCallable(
      this.#functions,
      'deleteSessionOrder',
    )({
      sessionId,
    });

    return from(response).pipe(
      tap(this.loadEffectObserver),
      map((result) => result.data as SessionRecord),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  registerRecordEntry(
    sessionId: string,
    email: string,
  ): Observable<SessionRecord | RegisterRecordError | undefined> {
    return this.getRecordBySessionIdAndEmail(sessionId, email).pipe(
      tap(this.loadEffectObserver),
      take(1),
      switchMap((record) => {
        if (!record) {
          return of(RegisterRecordError.NoRecord);
        } else if (record.registeredAt) {
          return of(RegisterRecordError.AlreadyRegistered);
        }

        record.registeredAt = Timestamp.now();

        return this.updateRecord(record.id, record).pipe(map(() => record));
      }),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  private getRecordBySessionIdAndEmail(
    sessionId: string,
    email: string,
  ): Observable<SessionRecord | undefined> {
    const recordsCollection = collection(this.firestore, this.collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('sessionId', '==', sessionId),
      where('email', '==', email),
      limit(1),
    );

    return (collectionData(recordsQuery) as Observable<SessionRecord[]>).pipe(
      tap(this.loadEffectObserver),
      take(1),
      map((records) => records[0]),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  private updateRecord(
    id: string,
    data: Partial<SessionRecord>,
  ): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);

    return from(updateDoc(docRef, { ...data }));
  }
}
