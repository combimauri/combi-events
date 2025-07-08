import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  limit,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import {
  BillingData,
  BillingRecord,
  EventRecord,
  RegisterRecordError,
  SimpleQR,
} from '@core/models';
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
export class EventRecordsService extends TableRecordsService<EventRecord> {
  protected override collectionName = 'event-records';
  protected override idColumn = 'eventId';

  readonly #functions = inject(Functions);

  getRealtimeRecordById(id: string): Observable<EventRecord | undefined> {
    const recordRef = doc(this.firestore, this.collectionName, id);

    return (docData<EventRecord>(recordRef) as Observable<EventRecord>).pipe(
      catchError((error) => handleError(error, this.logger)),
    );
  }

  getRecordById(id: string): Observable<EventRecord | undefined> {
    return this.getRealtimeRecordById(id).pipe(
      tap(this.loadEffectObserver),
      take(1),
    );
  }

  getRecordByEventIdAndEmail(
    eventId: string,
    email: string,
  ): Observable<EventRecord | undefined> {
    const recordsCollection = collection(this.firestore, this.collectionName);
    const recordsQuery = query(
      recordsCollection,
      where(this.idColumn, '==', eventId),
      where('email', '==', email),
      limit(1),
    );

    return (collectionData(recordsQuery) as Observable<EventRecord[]>).pipe(
      tap(this.loadEffectObserver),
      take(1),
      map((records) => records[0]),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  // This should be used only for free events until the payment service is restored
  registerRecord(
    eventId: string,
    { additionalAnswers, fullName, couponId }: BillingRecord,
  ): Observable<BillingData | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createEventOrder',
    )({ eventId, fullName, additionalAnswers, couponId });

    return from(response).pipe(
      tap(this.loadEffectObserver),
      map((result) => result.data as BillingData),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  // Temporary replacement for paid events
  registerSimpleRecord(
    eventId: string,
    { additionalAnswers, fullName, couponId }: BillingRecord,
  ): Observable<BillingData | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createSimpleEventOrder',
    )({ eventId, fullName, additionalAnswers, couponId });

    return from(response).pipe(
      tap(this.loadEffectObserver),
      map((result) => result.data as BillingData),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  setEventRecordValidation(id: string, validated: boolean): Observable<void> {
    const recordRef = doc(this.firestore, this.collectionName, id);

    return from(setDoc(recordRef, { validated }, { merge: true })).pipe(
      tap(this.loadEffectObserver),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  updateRecordNotes(id: string, notes: string): Observable<void> {
    const recordRef = doc(this.firestore, this.collectionName, id);

    return from(setDoc(recordRef, { notes }, { merge: true })).pipe(
      tap(this.loadEffectObserver),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  associateMainPaymentReceipt(id: string, link: string): Observable<void> {
    const recordRef = doc(this.firestore, this.collectionName, id);
    const paymentReceipts: SimpleQR[] = [{ id: 'main', link }];

    return from(setDoc(recordRef, { paymentReceipts }, { merge: true })).pipe(
      tap(this.loadEffectObserver),
      take(1),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  registerRecordEntry(
    id: string,
  ): Observable<EventRecord | RegisterRecordError | undefined> {
    return this.getRealtimeRecordById(id).pipe(
      tap(this.loadEffectObserver),
      take(1),
      switchMap((record) => {
        if (!record) {
          return of(RegisterRecordError.NoRecord);
        } else if (record.registeredAt) {
          return of(RegisterRecordError.AlreadyRegistered);
        }

        record.registeredAt = Timestamp.now();

        return this.updateRecord(id, record).pipe(map(() => record));
      }),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  private updateRecord(
    id: string,
    data: Partial<EventRecord>,
  ): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);

    return from(updateDoc(docRef, { ...data }));
  }
}
