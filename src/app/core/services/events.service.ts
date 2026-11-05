import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteField,
  doc,
  docData,
  Firestore,
  GeoPoint,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { AppEvent } from '@core/models';
import { loadEffect, handleError } from '@core/utils';
import { catchError, from, map, Observable, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

/**
 * Event attributes editable from the admin event form. Everything else
 * (count, additional questions, registries, price QRs, ...) is preserved on
 * update and initialised with defaults on create.
 */
export interface EventFormData {
  additionalRegistrationInfo: string;
  admins: string[];
  bannerImage: string;
  capacity: number;
  description: string;
  endDate: Date;
  hasMarketplace: boolean;
  hasSessions: boolean;
  image: string;
  listEvent: boolean;
  location: {
    name: string;
    geolocation: { latitude: number; longitude: number } | null;
  };
  maxSessionsPerUser: number;
  name: string;
  openMarketplace: boolean;
  openRegistration: boolean;
  price: {
    amount: number;
    currency: string;
    description: string;
    discount: number;
  };
  shortDescription: string;
  startDate: Date;
}

export const EVENT_ALREADY_EXISTS_ERROR =
  'Ya existe un evento con ese identificador. Elige otro.';

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

  /**
   * Creates `events/{id}` owned by `owner`. Runs in a transaction so an
   * existing event with the same id is never overwritten.
   */
  createEvent(
    id: string,
    data: EventFormData,
    owner: string,
  ): Observable<string | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, id);
    const { endDate, startDate, location, ...rest } = data;
    const newEvent = {
      ...rest,
      additionalQuestions: [],
      count: 0,
      createdAt: serverTimestamp(),
      date: {
        end: Timestamp.fromDate(endDate),
        start: Timestamp.fromDate(startDate),
      },
      id,
      location: {
        name: location.name,
        ...(location.geolocation && {
          geolocation: new GeoPoint(
            location.geolocation.latitude,
            location.geolocation.longitude,
          ),
        }),
      },
      owner,
      updatedAt: serverTimestamp(),
    };

    return from(
      runTransaction(this.#firestore, async (transaction) => {
        const snapshot = await transaction.get(docRef);

        if (snapshot.exists()) {
          throw new Error(EVENT_ALREADY_EXISTS_ERROR);
        }

        transaction.set(docRef, newEvent);
      }),
    ).pipe(
      tap(this.#loadEffectObserver),
      map(() => id),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  /**
   * Updates the editable attributes of an event. Nested maps (`price`,
   * `location`) are written field by field so attributes not handled by the
   * form (e.g. `price.qrs`, `price.discountCondition`) are preserved.
   */
  updateEvent(id: string, data: EventFormData): Observable<true | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, id);
    const { endDate, startDate, location, price, ...rest } = data;

    return from(
      updateDoc(docRef, {
        ...rest,
        date: {
          end: Timestamp.fromDate(endDate),
          start: Timestamp.fromDate(startDate),
        },
        'location.name': location.name,
        'location.geolocation': location.geolocation
          ? new GeoPoint(
              location.geolocation.latitude,
              location.geolocation.longitude,
            )
          : deleteField(),
        'price.amount': price.amount,
        'price.currency': price.currency,
        'price.description': price.description,
        'price.discount': price.discount,
        updatedAt: serverTimestamp(),
      }),
    ).pipe(
      tap(this.#loadEffectObserver),
      map(() => true as const),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
