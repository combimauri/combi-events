import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { BackButtonComponent } from '../back-button/back-button.component';

@Component({
  selector: 'combi-page-title',
  standalone: true,
  imports: [BackButtonComponent],
  template: `
    <header class="page-title">
      <combi-back-button [selfHandle]="selfHandle()" (goBack)="goBack.emit()" />
      <h1 class="page-title__text">
        <ng-content />
      </h1>
    </header>
  `,
  styles: `
    .page-title {
      align-items: center;
      display: flex;
      gap: 0.5rem;
      padding: 0.25rem 0;
    }

    .page-title__text {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {
  readonly selfHandle = input(true);

  readonly goBack = output();
}
