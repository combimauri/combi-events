import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'combi-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <a mat-icon-button (click)="handleGoBack()">
      <mat-icon fontIcon="chevron_left" />
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  readonly selfHandle = input.required<boolean>();

  readonly goBack = output();

  handleGoBack(): void {
    if (this.selfHandle()) {
      this.#router.navigate(['..'], { relativeTo: this.#route });
    } else {
      this.goBack.emit();
    }
  }
}
