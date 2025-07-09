import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import {
  Storage,
  UploadTask,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { loadEffect, handleError } from '@core/utils';
import { catchError, from, Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  readonly #functions = inject(Functions);
  readonly #storage = inject(Storage);
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  uploadPaymentReceipt(eventRecordId: string, file: File): UploadTask {
    const storageRef = ref(
      this.#storage,
      `payments/receipts/${eventRecordId}-${file.name}`,
    );

    return uploadBytesResumable(storageRef, file);
  }

  validateEventPayment(orderId: string): Observable<unknown> {
    const response = httpsCallable(
      this.#functions,
      'validateEventPayment',
    )({ orderId });

    return from(response).pipe(
      tap(this.#loadEffectObserver),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
