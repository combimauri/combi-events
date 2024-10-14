import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { BillingRecord } from '../../../../core/models/billing-record.model';
import { EventRecord } from '../../../../core/models/event-record.model';
import { LoadingState } from '../../../../core/states/loading.state';
import { UserState } from '../../../../core/states/user.state';
import { EventRecordState } from '../../../../core/states/event-record.state';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'combi-event-registration-form',
  standalone: true,
  imports: [
    BackButtonComponent,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  template: `
    <form #eventForm="ngForm" (ngSubmit)="register()">
      <mat-card appearance="outlined">
        <mat-card-content class="page-title">
          <combi-back-button />
          <h6>Inscripción al Evento</h6>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <p>Nombre Completo</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Tu respuesta</mat-label>
            <input
              matInput
              required
              cdkFocusInitial
              type="text"
              id="fullName"
              name="fullName"
              [disabled]="loading()"
              [(ngModel)]="fullName"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <p>Número de Teléfono</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Tu respuesta</mat-label>
            <input
              matInput
              required
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              [disabled]="loading()"
              [(ngModel)]="phoneNumber"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <button
        mat-fab
        extended
        type="submit"
        [disabled]="eventForm.invalid || loading()"
      >
        Registrarse y Pagar
      </button>
    </form>
  `,
  styles: `
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      mat-card-title p {
        font-size: 1rem;
      }

      mat-form-field {
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationFormComponent {
  fullName = '';
  phoneNumber = '';

  readonly eventForm = viewChild.required(NgForm);
  readonly submitForm = output<BillingRecord>();
  readonly loading = inject(LoadingState).loading;

  readonly #userState = inject(UserState);
  readonly #eventRecordState = inject(EventRecordState);

  constructor() {
    effect(() => (this.fullName = this.#userState.currentUser()?.displayName!));
    effect(() => this.patchForm(this.#eventRecordState.eventRecord()));
  }

  register(): void {
    if (this.eventForm().invalid) {
      return;
    }

    const email = this.#userState.currentUser()?.email!;
    const { fullName, phoneNumber } = this.eventForm().value;

    const billingRecord = {
      email,
      fullName,
      phoneNumber,
    };

    this.submitForm.emit(billingRecord);
  }

  private patchForm(eventRecord: EventRecord | null): void {
    if (!eventRecord) {
      return;
    }

    this.fullName = eventRecord.fullName;
    this.phoneNumber = eventRecord.phoneNumber;
  }
}
