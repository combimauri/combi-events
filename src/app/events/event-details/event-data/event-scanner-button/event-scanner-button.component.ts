import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'combi-event-scanner-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <a mat-fab extended routerLink="scanner">
      <mat-icon fontIcon="qr_code_scanner" />
      Escanear Entradas
    </a>
  `,
  styles: `
    a {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventScannerButtonComponent {}
