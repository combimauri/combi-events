import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'combi-title-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: ` <mat-spinner [diameter]="30"></mat-spinner> `,
  styles: `
    :host {
      margin: 0 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleSpinnerComponent {}
