import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EventState } from '@core/states';

@Component({
  selector: 'combi-event-login-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-fab extended (click)="navigateToLogin()">
      <mat-icon fontIcon="login" />
      Iniciar Sesión y Registrarse
    </button>
  `,
  styles: `
    button {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLoginButtonComponent {
  readonly #eventState = inject(EventState);
  readonly #router = inject(Router);

  readonly eventId = input.required<string>();

  navigateToLogin(): void {
    const eventId = this.eventId();
    const event = this.#eventState.event;
    // If event is not listed, registration is allowed, but it's hidden
    const returnUrl = event()?.listEvent
      ? `/${eventId}/register`
      : `/${eventId}`;

    this.#router.navigate(['/login'], {
      queryParams: { returnUrl },
    });
  }
}
