import { Component, output, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BillingRecord } from '../../../core/models/billing-record.model';

@Component({
  selector: 'gdg-event-registration',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form #eventForm="ngForm" (ngSubmit)="register()">
      <div>
        <label for="firstName">Nombre(s):</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          required
          [(ngModel)]="firstName"
        />
      </div>
      <div>
        <label for="lastName">Apellido(s):</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          required
          [(ngModel)]="lastName"
        />
      </div>
      <div>
        <label for="email">Correo Electrónico:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          [(ngModel)]="email"
        />
      </div>
      <div>
        <label for="phoneNumber">Número de teléfono:</label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          required
          [(ngModel)]="phoneNumber"
        />
      </div>
      <button type="submit">Registrarse</button>
    </form>
  `,
  styles: ``,
})
export class EventRegistrationComponent {
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
