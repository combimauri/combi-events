import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'combi-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <a mat-icon-button routerLink="..">
      <mat-icon>chevron_left</mat-icon>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {}
