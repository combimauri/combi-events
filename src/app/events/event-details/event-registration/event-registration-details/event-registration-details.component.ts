import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  AdditionalQuestion,
  BillingRecord,
  Coupon,
  Price,
  RegistrationStep,
} from '@core/models';
import { CouponsService, LoggerService } from '@core/services';
import { RegistrationStepState } from '@core/states';
import { BackButtonComponent } from '@shared/components';
import { QuestionLabelPipe } from '@shared/pipes';
import { Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-event-registration-details',
  standalone: true,
  imports: [
    BackButtonComponent,
    FormsModule,
    KeyValuePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    QuestionLabelPipe,
  ],
  template: `
    @if (billingRecord(); as billingRecord) {
      <mat-card appearance="outlined">
        <mat-card-content>
          <p>
            <b> Detalles del Registro </b>
          </p>
          <p><b>Correo Electrónico:</b> {{ billingRecord.email }}</p>
          <p><b>Nombre Completo:</b> {{ billingRecord.fullName }}</p>
          <p><b>Número de Teléfono:</b> {{ billingRecord.phoneNumber }}</p>
          @for (
            item of billingRecord.additionalAnswers | keyvalue;
            track item.key
          ) {
            <p>
              <b>{{ item.key | questionLabel: additionalQuestions() }}:</b>
              {{ item.value || 'N/A' }}
            </p>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="editRegistration()">
            Editar Registro
          </button>
        </mat-card-actions>
      </mat-card>
    }

    @if (price(); as price) {
      <mat-card appearance="outlined">
        <mat-card-content class="event-registration-details__price">
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
                El cupón no se aplicará hasta que confirmes el pago.
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

    <button mat-fab extended (click)="confirmRegistration()">Pagar</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-registration-details__price {
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
export class EventRegistrationDetailsComponent {
  couponCode = '';

  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly #couponService = inject(CouponsService);
  readonly #getCoupon$ = new Subject<{ couponId: string; eventId: string }>();
  readonly #logger = inject(LoggerService);
  readonly #registrationStepState = inject(RegistrationStepState);

  readonly coupon = toSignal(
    this.#getCoupon$.pipe(
      switchMap(({ couponId, eventId }) =>
        this.#couponService.getCouponByIdAndEventId(couponId, eventId),
      ),
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

  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly billingRecord = input<BillingRecord>();
  readonly confirmDetails = output<string | null>();
  readonly eventId = input.required<string>();
  readonly price = input<Price>();
  readonly showCouponInput = signal<boolean>(false);

  editRegistration(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  toggleCouponInputVisibility(): void {
    this.showCouponInput.update((show) => !show);
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
  }

  triggerCouponSearch(): void {
    const couponId = this.couponCode.trim();
    const eventId = this.eventId();

    if (!couponId || !eventId) {
      return;
    }

    this.#getCoupon$.next({ couponId, eventId });
  }

  confirmRegistration(): void {
    this.confirmDetails.emit(this.appliedCoupon()?.id || null);
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
