import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Coupon, Price } from '@core/models';
import { CouponsService, LoggerService } from '@core/services';
import { LoadingState } from '@core/states';
import { Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-coupon-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <form
      #couponForm="ngForm"
      class="coupon-form"
      (submit)="triggerCouponSearch()"
    >
      <h2 mat-dialog-title>Agregar Cupón</h2>
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Cupón</mat-label>
          <input
            matInput
            required
            id="couponCode"
            name="couponCode"
            type="text"
            [(ngModel)]="couponCode"
          />
          <button mat-icon-button matSuffix type="submit">
            <mat-icon fontIcon="redeem" />
          </button>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cerrar</button>
        <button
          mat-button
          type="submit"
          [disabled]="couponForm.invalid || loading()"
        >
          Agregar
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .coupon-form mat-dialog-content {
      display: flex;
      flex-direction: column;
      padding-top: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponFormComponent {
  couponCode = '';
  loading = inject(LoadingState).loading;

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

  readonly data: { eventId: string; productId: string; price: Price } =
    inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef);

  triggerCouponSearch(): void {
    const couponId = this.couponCode.trim();
    const eventId = this.data.eventId;
    const productId = this.data.productId;

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

    this.#logger.handleInfo('Cupón válido');
    this.dialogRef.close({ coupon });
  }
}
