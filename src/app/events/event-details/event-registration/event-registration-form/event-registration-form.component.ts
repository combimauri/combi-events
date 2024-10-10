import { Component, output, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { BillingRecord } from '../../../../core/models/billing-record.model';

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
          <h6>Registro al evento</h6>
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
              [(ngModel)]="lastName"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <p>Correo Electrónico</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Tu respuesta</mat-label>
            <input
              matInput
              required
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
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
              [(ngModel)]="phoneNumber"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <button mat-fab extended type="submit" [disabled]="eventForm.invalid">
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
})
export class EventRegistrationFormComponent {
  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';

  eventForm = viewChild.required(NgForm);

  submitForm = output<BillingRecord>();

  register(): void {
    if (this.eventForm().invalid) {
      return;
    }

    const billingRecord = this.eventForm().value as BillingRecord;

    this.submitForm.emit(billingRecord);
  }
}
