import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
} from '@angular/fire/firestore';
import { catchError, Observable, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';
import { Event } from '../models/event.model';
import { handleError } from '../utils/handle-error.utils';
import { loadEffect } from '../utils/load-effect.utils';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'events';
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getEvents(): Observable<Event[] | undefined> {
    const eventsCollection = collection(this.#firestore, this.#collectionName);

    return (
      collectionData<Event>(eventsCollection) as Observable<Event[]>
    ).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getEventById(id: string): Observable<Event | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, id);

    return (docData(docRef) as Observable<Event>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
