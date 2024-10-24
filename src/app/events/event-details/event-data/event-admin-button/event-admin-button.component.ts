import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'combi-event-admin-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <a mat-fab extended routerLink="admin">
      <mat-icon fontIcon="admin_panel_settings" />
      Gestionar Evento
    </a>
  `,
  styles: `
    a {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAdminButtonComponent {}
