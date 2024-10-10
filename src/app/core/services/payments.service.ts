import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BillingRecord, BillingData } from '../models/billing-record.model';
import { WIframe } from '../models/w-iframe.model';
import { WToken } from '../models/w-token.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  #basePath = environment.wolipay.basePath;
  #http = inject(HttpClient);

  generateAuthToken(): Observable<string | undefined> {
    const { email, password } = environment.wolipay;

    return this.#http
      .post<WToken>(`${this.#basePath}/generateToken`, {
        email,
        password,
      })
      .pipe(map((response) => response?.body?.token));
  }

  getBillingData(token: string, billing: BillingRecord): Observable<BillingData> {
    const id = crypto.randomUUID();

    return this.#http
      .post<WIframe>(
        `${this.#basePath}/getWolipayiFrame`,
        {
          id,
          title: 'DevFest Cochabamba 2024',
          description: 'Registro al DevFest Cochabamba 2024',
          payment: {
            amount: 50,
            currency: 'BOB',
            totalAmount: 40,
            discount: {
              amount: 10,
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
        map((response) => {
          const url = response?.body?.iFrameUrl;
          const orderId = id;
          const lastSlashIndex = url.lastIndexOf('/');
          const transactionId = url.substring(lastSlashIndex + 1);

          return {
            url,
            orderId,
            transactionId,
          };
        }),
      );
  }
}
