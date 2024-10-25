import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'combi-whatsapp-send-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <form
      #waForm="ngForm"
      class="whats-app-send-form"
      (ngSubmit)="sendMessage()"
    >
      <h2 mat-dialog-title>Enviar Mensaje por WhatsApp</h2>
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Número de Teléfono</mat-label>
          <input
            matInput
            required
            type="text"
            name="phoneNumber"
            [ngModel]="data.phoneNumber"
          />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Mensaje</mat-label>
          <textarea
            matInput
            required
            type="text"
            name="message"
            rows="5"
            [ngModel]="data.message"
          >
          </textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cerrar</button>
        <button mat-button type="submit" [disabled]="waForm.invalid">
          Enviar
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .whats-app-send-form mat-dialog-content {
      display: flex;
      flex-direction: column;
      padding-top: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsappSendFormComponent {
  readonly #platformId = inject(PLATFORM_ID);
  readonly data: { phoneNumber: string; message: string } =
    inject(MAT_DIALOG_DATA);
  readonly waForm = viewChild.required(NgForm);

  sendMessage(): void {
    if (!isPlatformBrowser(this.#platformId) || this.waForm().invalid) {
      return;
    }

    const { phoneNumber, message } = this.waForm().value;

    const whatsappLink = `https://api.whatsapp.com/send?phone=${
      phoneNumber
    }&text=${encodeURI(message)}`;

    window.open(whatsappLink, '_blank');
  }
}
