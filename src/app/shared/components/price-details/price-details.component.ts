import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Coupon, Price } from '@core/models';
import { EventRecordState } from '@core/states';
import { Subject, switchMap, tap } from 'rxjs';
import { CouponFormComponent } from './coupon-form/coupon-form.component';

@Component({
  selector: 'combi-price-details',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
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
              {{ discount() }} {{ price.currency }}
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
          @if (appliedCoupon()) {
            <button mat-button (click)="removeCoupon()">Quitar Cupón</button>
          } @else {
            <button mat-button (click)="openCouponDialog$.next()">
              Agregar Cupón
            </button>
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
  readonly appliedCoupon = model<Coupon | null>(null);
  readonly dialog = inject(MatDialog);
  readonly eventId = input.required<string>();
  readonly eventRecord = inject(EventRecordState).eventRecord;
  readonly openCouponDialog$ = new Subject<void>();
  readonly price = input.required<Price>();
  readonly productId = input<string>();

  protected readonly discount = computed(() => {
    const eventRecord = this.eventRecord();
    const price = this.price();

    if (price.discountCondition === 'REGISTERED') {
      if (eventRecord?.validated) {
        return price.discount;
      }

      return 0;
    }

    return price.discount;
  });

  protected readonly amountToPay = computed(() => {
    const total =
      (this.price()?.amount || 0) -
      (this.discount() || 0) -
      (this.appliedCoupon()?.value || 0);

    return total > 0 ? total : 0;
  });
  readonly afterDialogClosed = toSignal(
    this.openCouponDialog$.pipe(
      switchMap(() =>
        this.dialog
          .open(CouponFormComponent, {
            data: {
              eventId: this.eventId(),
              productId: this.productId(),
              price: this.price(),
            },
            width: '400px',
          })
          .afterClosed(),
      ),
      tap(({ coupon }) => {
        if (coupon) {
          this.appliedCoupon.set(coupon);
        }
      }),
    ),
  );

  removeCoupon(): void {
    this.appliedCoupon.set(null);
  }
}
