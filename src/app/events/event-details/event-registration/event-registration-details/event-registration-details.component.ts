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
  RegistrationStep,
} from '@core/models';
import { RegistrationStepState } from '@core/states';
import { PriceDetailsComponent } from '@shared/components';
import { QuestionLabelPipe } from '@shared/pipes';

@Component({
  selector: 'combi-event-registration-details',
  standalone: true,
  imports: [
    KeyValuePipe,
    MatButtonModule,
    MatCardModule,
    PriceDetailsComponent,
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

    @if (price()?.amount) {
      <combi-price-details
        [eventId]="this.eventId()"
        [price]="price()!"
        [(appliedCoupon)]="appliedCoupon"
      />
    }

    <button mat-fab extended (click)="confirmRegistration()">
      @if (price()?.amount) {
        Pagar
      } @else {
        Confirmar Registro
      }
    </button>
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
export class EventRegistrationDetailsComponent {
  readonly #registrationStepState = inject(RegistrationStepState);

  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly billingRecord = input<BillingRecord>();
  readonly confirmDetails = output<string | null>();
  readonly eventId = input.required<string>();
  readonly price = input<Price>();

  editRegistration(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  confirmRegistration(): void {
    this.confirmDetails.emit(this.appliedCoupon()?.id || null);
  }
}
