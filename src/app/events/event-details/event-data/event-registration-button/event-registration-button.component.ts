import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'combi-event-registration-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <a mat-fab extended routerLink="register">
      <mat-icon fontIcon="how_to_reg" />
      Registrarse
    </a>
  `,
  styles: `
    a {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationButtonComponent {}
