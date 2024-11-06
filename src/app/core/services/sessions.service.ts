import { inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  collection,
  where,
  collectionData,
  Firestore,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Session } from '@core/models';
import { loadEffect, handleError } from '@core/utils';
import { Observable, tap, take, catchError } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'sessions';
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getSessionById(id: string): Observable<Session | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, id);

    return (docData(docRef) as Observable<Session>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getRealtimeSessionsByEventId(
    eventId: string,
  ): Observable<Session[] | undefined> {
    const productsCollection = collection(
      this.#firestore,
      this.#collectionName,
    );
    const productsQuery = query(
      productsCollection,
      where('eventId', '==', eventId),
      where('isActive', '==', true),
      orderBy('date.start'),
    );

    return (collectionData(productsQuery) as Observable<Session[]>).pipe(
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
