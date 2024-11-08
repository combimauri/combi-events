import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  limit,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BillingData, BillingRecord, EventRecord } from '@core/models';
import { handleError } from '@core/utils';
import { catchError, from, map, Observable, take, tap } from 'rxjs';
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

  registerRecord(
    eventId: string,
    { additionalAnswers, fullName, phoneNumber, couponId }: BillingRecord,
  ): Observable<BillingData | undefined> {
    const response = httpsCallable(
      this.#functions,
      'createEventOrder',
    )({ eventId, fullName, phoneNumber, additionalAnswers, couponId });

    return from(response).pipe(
      tap(this.loadEffectObserver),
      map((result) => result.data as BillingData),
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
}
