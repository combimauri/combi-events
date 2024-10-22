import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BillingData,
  BillingRecord,
  Price,
  WolipayIFrame,
  WolipayToken,
} from '@core/models';
import { loadEffect, handleError } from '@core/utils';
import { environment } from '@env/environment';
import { catchError, map, Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';

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
    { email, fullName, phoneNumber }: BillingRecord,
    title: string,
    { description, amount, currency, discount }: Price,
  ): Observable<BillingData | undefined> {
    const id = crypto.randomUUID();
    const splitName = fullName.split(' ');
    const lastName = splitName.pop();
    const firstName = splitName.join(' ') || lastName;

    return this.#http
      .post<WolipayIFrame>(
        `${this.#basePath}/getWolipayiFrame`,
        {
          id,
          title,
          description: description,
          notifyUrl: environment.wolipay.notifyUrl,
          payment: {
            amount: amount,
            currency: currency,
            totalAmount: amount - discount,
            discount: {
              amount: discount,
              type: 'amount',
            },
          },
          billing: {
            firstName,
            lastName,
            email,
            phoneNumber,
          },
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
