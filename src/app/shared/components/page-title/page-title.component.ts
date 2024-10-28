import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BackButtonComponent } from '../back-button/back-button.component';

@Component({
  selector: 'combi-page-title',
  standalone: true,
  imports: [BackButtonComponent, MatCardModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-content class="page-title">
        <combi-back-button />
        <h4>
          <ng-content />
        </h4>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .page-title {
      align-items: center;
      display: flex !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {}
