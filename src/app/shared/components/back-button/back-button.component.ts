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
    <button
      mat-icon-button
      type="button"
      aria-label="Volver"
      (click)="handleGoBack()"
    >
      <mat-icon aria-hidden="true" fontIcon="chevron_left" />
    </button>
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
