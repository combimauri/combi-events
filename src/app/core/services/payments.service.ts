import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { loadEffect, handleError } from '@core/utils';
import { catchError, from, Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  readonly #functions = inject(Functions);
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  validatePayment(orderId: string): Observable<unknown> {
    const response = httpsCallable(
      this.#functions,
      'validatePayment',
    )({ orderId });

    return from(response).pipe(
      tap(this.#loadEffectObserver),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
