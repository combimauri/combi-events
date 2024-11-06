import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  query,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { SessionRecord } from '@core/models';
import { handleError, loadEffect } from '@core/utils';
import { catchError, from, map, Observable, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class SessionRecordsService {
  readonly #collectionName = 'session-records';
  readonly #firestore = inject(Firestore);
  readonly #functions = inject(Functions);
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getRecordsByEventIdAndEmail(
    eventId: string,
    email: string,
  ): Observable<SessionRecord[] | undefined> {
    const recordsCollection = collection(this.#firestore, this.#collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('eventId', '==', eventId),
      where('email', '==', email),
    );

    return (collectionData(recordsQuery) as Observable<SessionRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
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
      tap(this.#loadEffectObserver),
      map((result) => result.data as SessionRecord),
      catchError((error) => handleError(error, this.#logger)),
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
      tap(this.#loadEffectObserver),
      map((result) => result.data as SessionRecord),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
