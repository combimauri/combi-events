import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  limit,
  query,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BillingData, BillingRecord, ProductRecord } from '@core/models';
import { handleError, loadEffect } from '@core/utils';
import { catchError, from, map, Observable, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class ProductRecordsService {
  readonly #collectionName = 'product-records';
  readonly #firestore = inject(Firestore);
  readonly #functions = inject(Functions);
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getRealtimeRecordById(id: string): Observable<ProductRecord | undefined> {
    const recordRef = doc(this.#firestore, this.#collectionName, id);

    return (
      docData<ProductRecord>(recordRef) as Observable<ProductRecord>
    ).pipe(catchError((error) => handleError(error, this.#logger)));
  }

  getRecordByProductIdAndEmail(
    productId: string,
    email: string,
  ): Observable<ProductRecord | undefined> {
    const recordsCollection = collection(this.#firestore, this.#collectionName);
    const recordsQuery = query(
      recordsCollection,
      where('productId', '==', productId),
      where('email', '==', email),
      limit(1),
    );

    return (collectionData(recordsQuery) as Observable<ProductRecord[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      map((records) => records[0]),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  registerRecord(
    eventId: string,
    productId: string,
    { additionalAnswers, fullName, phoneNumber, couponId }: BillingRecord,
  ): Observable<BillingData | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createProductOrder',
    )({
      eventId,
      productId,
      fullName,
      phoneNumber,
      additionalAnswers,
      couponId,
    });

    return from(response).pipe(
      tap(this.#loadEffectObserver),
      map((result) => result.data as BillingData),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
