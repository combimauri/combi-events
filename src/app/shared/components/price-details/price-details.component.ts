import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Coupon, Price } from '@core/models';
import { CouponsService, LoggerService } from '@core/services';
import { Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-price-details',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    @if (price(); as price) {
      <mat-card appearance="outlined">
        <mat-card-content class="price-details">
          <p>
            <b> Detalles del Pago </b>
          </p>
          <p>
            {{ price.description }}
          </p>
          <p>
            <b>Precio:</b> <span class="price-spacer"></span>
            <span class="price-amount">
              {{ price.amount }} {{ price.currency }}
            </span>
          </p>
          <p>
            <b>Descuento:</b> <span class="price-spacer"></span>
            <span class="price-amount">
              {{ price.discount }} {{ price.currency }}
            </span>
          </p>
          @if (appliedCoupon(); as coupon) {
            <p class="price-coupon">
              <b>Cupón:</b> <span class="price-spacer"></span>
              <span class="price-amount">
                {{ coupon.value }} {{ price.currency }}
              </span>
              <span class="coupon-warning">
                *No se aplicará hasta que confirmes el pago.
              </span>
            </p>
          }
          <p>
            <b>Total:</b> <span class="price-spacer"></span>
            <span class="price-amount">
              {{ amountToPay() }}
              {{ price.currency }}
            </span>
          </p>
        </mat-card-content>
        <mat-card-actions>
          @if (!showCouponInput()) {
            @if (appliedCoupon()) {
              <button mat-button (click)="removeCoupon()">Quitar Cupón</button>
            } @else {
              <button mat-button (click)="toggleCouponInputVisibility()">
                Agregar Cupón
              </button>
            }
          } @else {
            <form #couponForm="ngForm" (submit)="triggerCouponSearch()">
              <mat-form-field appearance="outline">
                <mat-label>Agregar Cupón</mat-label>
                <input
                  matInput
                  id="couponCode"
                  name="couponCode"
                  type="text"
                  [(ngModel)]="couponCode"
                />
                <button mat-icon-button matSuffix type="submit">
                  <mat-icon fontIcon="redeem" />
                </button>
              </mat-form-field>
              <button mat-button class="action-button" type="submit">
                Agregar
              </button>
              <button
                mat-button
                class="action-button"
                type="button"
                (click)="toggleCouponInputVisibility()"
              >
                Cancelar
              </button>
            </form>
          }
        </mat-card-actions>
      </mat-card>
    }
  `,
  styles: `
    .price-details {
      p {
        display: flex;

        .price-spacer {
          border-bottom: 2px dotted;
          flex: 1 1 auto;
          margin: 0 1rem 0.25rem;
        }

        .price-amount {
          font-family: monospace, sans-serif;
        }
      }

      .price-coupon {
        color: #5fb044;
        position: relative;

        .coupon-warning {
          bottom: -1rem;
          font-size: 0.65rem;
          left: 0;
          position: absolute;
        }
      }
    }

    form {
      width: 100%;

      mat-form-field {
        padding: 1rem 0.5rem 0;
        width: 100%;

        button {
          margin-right: 0.5rem;
        }
      }

      .action-button {
        margin-top: -1rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceDetailsComponent {
  couponCode = '';

  readonly #couponService = inject(CouponsService);
  readonly #getCoupon$ = new Subject<{
    couponId: string;
    eventId: string;
    productId?: string;
  }>();
  readonly #logger = inject(LoggerService);

  readonly coupon = toSignal(
    this.#getCoupon$.pipe(
      switchMap(({ couponId, eventId, productId }) => {
        if (!productId) {
          return this.#couponService.getCouponByIdAndEventId(couponId, eventId);
        }

        return this.#couponService.getCouponByIdAndProductId(
          couponId,
          productId,
        );
      }),
      tap((coupon) => this.handleCouponResponse(coupon)),
    ),
  );
  readonly amountToPay = computed(() => {
    const total =
      (this.price()?.amount || 0) -
      (this.price()?.discount || 0) -
      (this.appliedCoupon()?.value || 0);

    return total > 0 ? total : 0;
  });

  readonly appliedCoupon = model<Coupon | null>(null);
  readonly eventId = input.required<string>();
  readonly price = input.required<Price>();
  readonly productId = input<string>();
  readonly showCouponInput = signal<boolean>(false);

  toggleCouponInputVisibility(): void {
    this.showCouponInput.update((show) => !show);
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
  }

  triggerCouponSearch(): void {
    const couponId = this.couponCode.trim();
    const eventId = this.eventId();
    const productId = this.productId();

    if (!couponId) {
      return;
    }

    this.#getCoupon$.next({ couponId, eventId, productId });
  }

  private handleCouponResponse(coupon: Coupon | undefined): void {
    if (!coupon) {
      return;
    }

    this.couponCode = '';

    this.appliedCoupon.set(coupon);
    this.toggleCouponInputVisibility();
    this.#logger.handleSuccess('Cupón válido');
  }
}
