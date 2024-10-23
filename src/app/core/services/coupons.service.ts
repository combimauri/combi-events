import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  limit,
  query,
  where,
} from '@angular/fire/firestore';
import { Coupon } from '@core/models';
import { handleError, loadEffect } from '@core/utils';
import { catchError, map, Observable, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class CouponsService {
  readonly #collectionName = 'coupons';
  readonly #firestore = inject(Firestore);
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);

  getCouponByIdAndEventId(
    id: string,
    eventId: string,
  ): Observable<Coupon | undefined> {
    const couponsCollection = collection(this.#firestore, this.#collectionName);
    const couponsQuery = query(
      couponsCollection,
      where('id', '==', id),
      where('eventId', '==', eventId),
      where('isActive', '==', true),
      limit(1),
    );

    return (collectionData(couponsQuery) as Observable<Coupon[]>).pipe(
      tap(this.#loadEffectObserver),
      take(1),
      map((coupons) => {
        const coupon = coupons[0];

        if (!coupon) {
          throw new Error('No se encontró el cupón.');
        }

        if (coupon.count < coupon.limit) {
          return coupon;
        }

        throw new Error('Se alcanzó el límite de usos del cupón.');
      }),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
