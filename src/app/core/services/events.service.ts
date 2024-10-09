import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
} from '@angular/fire/firestore';
import { Observable, take } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'events';

  getEvents(): Observable<Event[]> {
    const eventsCollection = collection(this.#firestore, this.#collectionName);

    return collectionData<Event>(eventsCollection) as Observable<Event[]>;
  }

  getEventById(id: string): Observable<Event | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, id);

    return (docData(docRef) as Observable<Event>).pipe(take(1));
  }
}
