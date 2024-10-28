import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  query,
  where,
} from '@angular/fire/firestore';
import { handleError, loadEffect } from '@core/utils';
import { LoggerService } from './logger.service';
import { Product } from '@core/models';
import { catchError, Observable, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  readonly #firestore = inject(Firestore);
  readonly #collectionName = 'products';
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getProductById(id: string): Observable<Product | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, id);

    return (docData(docRef) as Observable<Product>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  getProductsByEventId(eventId: string): Observable<Product[] | undefined> {
    const productsCollection = collection(
      this.#firestore,
      this.#collectionName,
    );
    const productsQuery = query(
      productsCollection,
      where('eventId', '==', eventId),
      where('isActive', '==', true),
    );

    return (collectionData(productsQuery) as Observable<Product[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
