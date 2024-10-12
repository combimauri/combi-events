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

@Component({
  selector: 'combi-event-registration-form',
  standalone: true,
  imports: [
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
        <mat-card-content class="event-registration-form__title">
          <a mat-icon-button routerLink="..">
            <mat-icon>chevron_left</mat-icon>
          </a>
          <h6>Inscripción al Evento</h6>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <p>Nombre(s)</p>
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
              id="firstName"
              name="firstName"
              [disabled]="loading()"
              [(ngModel)]="firstName"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <p>Apellido(s)</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Tu respuesta</mat-label>
            <input
              matInput
              required
              type="text"
              id="lastName"
              name="lastName"
              [disabled]="loading()"
              [(ngModel)]="lastName"
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

      .event-registration-form__title {
        align-items: center;
        display: flex;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationFormComponent {
  firstName = '';
  lastName = '';
  phoneNumber = '';

  readonly eventForm = viewChild.required(NgForm);
  readonly submitForm = output<BillingRecord>();
  readonly loading = inject(LoadingState).loading;

  readonly #userState = inject(UserState);
  readonly #eventRecordState = inject(EventRecordState);

  constructor() {
    effect(() => this.patchForm(this.#eventRecordState.eventRecord()));
  }

  register(): void {
    if (this.eventForm().invalid) {
      return;
    }

    const email = this.#userState.currentUser()?.email!;
    const { firstName, lastName, phoneNumber } = this.eventForm().value;

    const billingRecord = {
      email,
      firstName,
      lastName,
      phoneNumber,
    };

    this.submitForm.emit(billingRecord);
  }

  private patchForm(eventRecord: EventRecord | null): void {
    if (!eventRecord) {
      return;
    }

    this.firstName = eventRecord.firstName;
    this.lastName = eventRecord.lastName;
    this.phoneNumber = eventRecord.phoneNumber;
  }
}
