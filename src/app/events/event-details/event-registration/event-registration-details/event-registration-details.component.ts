import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  AdditionalQuestion,
  BillingRecord,
  Price,
  RegistrationStep,
} from '@core/models';
import { RegistrationStepState } from '@core/states';
import { BackButtonComponent } from '@shared/components';
import { QuestionLabelPipe } from '@shared/pipes';

@Component({
  selector: 'combi-event-registration-details',
  standalone: true,
  imports: [
    BackButtonComponent,
    KeyValuePipe,
    MatButtonModule,
    MatCardModule,
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
          <p>
            <b>Total:</b> <span class="price-spacer"></span>
            <span class="price-amount">
              {{ price.amount - price.discount }}
              {{ price.currency }}
            </span>
          </p>
        </mat-card-content>
      </mat-card>
    }

    <button mat-fab extended (click)="confirmDetails.emit()">Pagar</button>
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
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationDetailsComponent {
  readonly #registrationStepState = inject(RegistrationStepState);

  readonly confirmDetails = output<void>();
  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly billingRecord = input<BillingRecord>();
  readonly price = input<Price>();

  editRegistration(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }
}
