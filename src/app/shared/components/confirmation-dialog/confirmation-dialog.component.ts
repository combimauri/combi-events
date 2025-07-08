import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'combi-confirmation-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>
      {{ title }}
    </h2>
    <mat-dialog-content>
      {{ content }}
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false" cdkFocusInitial>No</button>
      <button mat-button [mat-dialog-close]="true">Ok</button>
    </mat-dialog-actions>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly #data = inject<{ title: string; content: string }>(MAT_DIALOG_DATA);
  protected readonly title = this.#data.title;
  protected readonly content = this.#data.content;
}
