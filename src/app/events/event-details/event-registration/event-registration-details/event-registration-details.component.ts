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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
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
        [staffRegistration]="staffRegistration"
        [(appliedCoupon)]="appliedCoupon"
      />
    }

    @if (staffRegistration) {
      <mat-card appearance="outlined">
        <mat-card-content>
          <p>
            *Para confirmar tu registro como miembro del Staff o Speaker, debes
            introducir un cupón válido.
          </p>
        </mat-card-content>
      </mat-card>
    }

    <button
      mat-fab
      extended
      (click)="confirmRegistration()"
      [disabled]="disableRegistrationButton()"
    >
      @if (price()?.amount && !staffRegistration) {
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
  readonly #activatedRoute = inject(ActivatedRoute);

  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly billingRecord = input<BillingRecord>();
  readonly confirmDetails = output<Coupon | null>();
  readonly eventId = input.required<string>();
  readonly price = input<Price>();

  protected readonly appliedCoupon = signal<Coupon | null>(null);
  protected readonly staffRegistration =
    this.#activatedRoute.snapshot.routeConfig?.path === 'staff-registration';
  protected readonly disableRegistrationButton = computed(() => {
    if (!this.staffRegistration) {
      return false;
    }

    return !this.appliedCoupon();
  });

  editRegistration(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  confirmRegistration(): void {
    if (this.disableRegistrationButton()) {
      return;
    }

    this.confirmDetails.emit(this.appliedCoupon());
  }
}
