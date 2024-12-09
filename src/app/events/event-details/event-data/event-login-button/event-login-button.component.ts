import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

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
  readonly eventId = input.required<string>();

  readonly #router = inject(Router);

  navigateToLogin(): void {
    const eventId = this.eventId();
    const returnUrl = `/${eventId}/register`;

    this.#router.navigate(['/login'], {
      queryParams: { returnUrl },
    });
  }
}
