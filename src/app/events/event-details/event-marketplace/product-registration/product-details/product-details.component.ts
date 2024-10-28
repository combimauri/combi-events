import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  AdditionalQuestion,
  BillingRecord,
  Coupon,
  Price,
  Product,
  RegistrationStep,
} from '@core/models';
import { RegistrationStepState } from '@core/states';
import { PriceDetailsComponent } from '@shared/components';
import { QuestionLabelPipe } from '@shared/pipes';

@Component({
  selector: 'combi-product-details',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    KeyValuePipe,
    PriceDetailsComponent,
    QuestionLabelPipe,
  ],
  template: `
    @if (billingRecord(); as billingRecord) {
      <mat-card appearance="outlined">
        <mat-card-content>
          <p>
            <b> Detalles de la Compra </b>
          </p>
          <p><b>Producto:</b> {{ product().name }}</p>
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
      <combi-price-details
        [eventId]="this.eventId()"
        [price]="price"
        [productId]="product().id"
        [(appliedCoupon)]="appliedCoupon"
      />
    }

    <button mat-fab extended (click)="confirmPurchase()">Pagar</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsComponent {
  readonly #registrationStepState = inject(RegistrationStepState);

  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly billingRecord = input<BillingRecord>();
  readonly confirmDetails = output<string | null>();
  readonly eventId = input.required<string>();
  readonly price = input.required<Price>();
  readonly product = input.required<Product>();

  editRegistration(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  confirmPurchase(): void {
    this.confirmDetails.emit(this.appliedCoupon()?.id || null);
  }
}
