import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { AppEvent } from '@core/models';
import { loadEffect, handleError } from '@core/utils';
import { catchError, Observable, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'events';
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getEvents(): Observable<AppEvent[] | undefined> {
    const eventsCollection = collection(this.#firestore, this.#collectionName);
    const eventsQuery = query(
      eventsCollection,
      where('listEvent', '==', true),
      orderBy('date.start', 'desc'),
    );

    return (
      collectionData<AppEvent>(eventsQuery) as Observable<AppEvent[]>
    ).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getEventsByOwner(owner: string): Observable<AppEvent[] | undefined> {
    const eventsCollection = collection(this.#firestore, this.#collectionName);
    const eventsQuery = query(
      eventsCollection,
      orderBy('date.start', 'desc'),
      where('owner', '==', owner),
    );

    return (
      collectionData<AppEvent>(eventsQuery) as Observable<AppEvent[]>
    ).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getEventById(id: string): Observable<AppEvent | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, id);

    return (docData(docRef) as Observable<AppEvent>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
