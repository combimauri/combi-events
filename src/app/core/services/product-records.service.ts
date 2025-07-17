import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  limit,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import {
  Functions,
  httpsCallable,
  HttpsCallableResult,
} from '@angular/fire/functions';
import {
  BillingData,
  BillingRecord,
  PaymentReceipts,
  ProductRecord,
} from '@core/models';
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

  // This should be used only for free products until the payment service is restored
  registerRecord(
    eventId: string,
    productId: string,
    { additionalAnswers, fullName, couponId }: BillingRecord,
  ): Observable<BillingData | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createProductOrder',
    )({
      eventId,
      productId,
      fullName,
      additionalAnswers,
      couponId,
    });

    return from(response).pipe(
      tap(this.#loadEffectObserver),
      map((result) => result.data as BillingData),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  // Temporary replacement for paid products
  registerSimpleRecord(
    eventId: string,
    productId: string,
    { additionalAnswers, fullName, couponId }: BillingRecord,
  ): Observable<BillingData | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createSimpleProductOrder',
    )({ eventId, productId, fullName, additionalAnswers, couponId });

    return from(response).pipe(
      tap(this.#loadEffectObserver),
      map((result) => result.data as BillingData),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  associateMainPaymentReceipt(id: string, links: string[]): Observable<void> {
    const recordRef = doc(this.#firestore, this.#collectionName, id);
    const paymentReceipts: PaymentReceipts[] = [{ id: 'main', links }];

    return from(setDoc(recordRef, { paymentReceipts }, { merge: true })).pipe(
      tap(this.#loadEffectObserver),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  sendPaymentReceiptEmail(
    productRecordId?: string,
  ): Promise<HttpsCallableResult<unknown>> | void {
    if (!productRecordId) {
      return;
    }

    return httpsCallable(
      this.#functions,
      'sendProductPaymentReceiptEmail',
    )({ productRecordId });
  }
}
