import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  EventEmitter,
  input,
  Output,
  TemplateRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScanStatus } from '../base-scanner.component';

@Component({
  selector: 'combi-scanner-ui',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    NgTemplateOutlet,
    ZXingScannerModule,
  ],
  template: `
    @switch (scanStatus()) {
      @case ('SCANNING') {
        <zxing-scanner (scanSuccess)="scanSuccess.emit($event)" />
      }
      @case ('SUCCESS') {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title class="scanner-ui__success-message">
              {{ statusMessage() }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="scanner-ui__image-container">
              <img src="success.webp" alt="imagen de éxito" />
            </div>
            @if (successDetailsTemplate()) {
              <ng-container *ngTemplateOutlet="successDetailsTemplate()!" />
            }
          </mat-card-content>
        </mat-card>
        <ng-template *ngTemplateOutlet="scanAgainButton" />
      }
      @case ('ERROR') {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title class="scanner-ui__error-message">
              {{ statusMessage() }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="scanner-ui__image-container">
              <img src="error.webp" alt="imagen de error" />
            </div>
          </mat-card-content>
        </mat-card>
        <ng-template *ngTemplateOutlet="scanAgainButton" />
      }
    }

    <ng-template #scanAgainButton>
      <button
        mat-fab
        extended
        type="button"
        class="scanner-ui__scan-again-button"
        (click)="scanAgain.emit()"
      >
        Volver a Escanear
      </button>
    </ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .scanner-ui__success-message {
      color: #4caf50;
    }

    .scanner-ui__error-message {
      color: #b00020;
    }

    .scanner-ui__image-container {
      display: flex;
      justify-content: center;
      padding-top: 1rem;

      img {
        max-width: 100%;
      }
    }

    .scanner-ui__scan-again-button {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerUiComponent {
  scanStatus = input.required<ScanStatus>();
  statusMessage = input.required<string>();

  @Output() scanSuccess = new EventEmitter<string>();
  @Output() scanAgain = new EventEmitter<void>();

  successDetailsTemplate = contentChild<TemplateRef<any>>('successDetails');
}

