import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';
import { BillingRecord, BillingData } from '../models/billing-record.model';
import { Event } from '../models/event.model';
import { WolipayIFrame } from '../models/wolipay-iframe.model';
import { WolipayToken } from '../models/wolipay-token.model';
import { loadEffect } from '../utils/load-effect.utils';
import { handleError } from '../utils/handle-error.utils';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  readonly #basePath = environment.wolipay.basePath;
  readonly #validatePath = '/api/validatePayment';
  readonly #http = inject(HttpClient);
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  generateAuthToken(): Observable<string | undefined> {
    const { email, password } = environment.wolipay;

    return this.#http
      .post<WolipayToken>(`${this.#basePath}/generateToken`, {
        email,
        password,
      })
      .pipe(
        tap(this.#loadEffectObserver),
        map((response) => response?.body?.token),
        catchError((error) => handleError(error, this.#logger)),
      );
  }

  getBillingData(
    token: string,
    billing: BillingRecord,
    event: Event,
  ): Observable<BillingData | undefined> {
    const id = crypto.randomUUID();

    return this.#http
      .post<WolipayIFrame>(
        `${this.#basePath}/getWolipayiFrame`,
        {
          id,
          title: event.name,
          description: event.price.description,
          notifyUrl: environment.wolipay.notifyUrl,
          payment: {
            amount: event.price.amount,
            currency: event.price.currency,
            totalAmount: event.price.amount - event.price.discount,
            discount: {
              amount: event.price.discount,
              type: 'amount',
            },
          },
          billing,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .pipe(
        tap(this.#loadEffectObserver),
        map((response) => {
          const url = response?.body?.iFrameUrl;
          const paymentId = id;
          const lastSlashIndex = url.lastIndexOf('/');
          const orderId = url.substring(lastSlashIndex + 1);

          return {
            url,
            orderId,
            paymentId,
          };
        }),
        catchError((error) => handleError(error, this.#logger)),
      );
  }

  validatePayment(orderId: string): Observable<unknown> {
    return this.#http.get(this.#validatePath, { params: { orderId } }).pipe(
      tap(this.#loadEffectObserver),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
