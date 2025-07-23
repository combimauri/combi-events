import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SimpleQR } from '@core/models';
import { LoadingState } from '@core/states';
import { SanitizeUrlPipe } from '@shared/pipes';
import { UploadBoxComponent } from './upload-box/upload-box.component';

@Component({
  selector: 'combi-payment-card',
  standalone: true,
  imports: [
    MatButtonModule,
    MatProgressBarModule,
    SanitizeUrlPipe,
    UploadBoxComponent,
  ],
  template: `
    <div class="payment-card">
      @if (!loading() && !iFrameUrl() && !mainQr()) {
        @defer (on timer(2s)) {
          <p>
            Ha ocurrido un error al cargar la pasarela de pago. Por favor,
            inténtalo de nuevo.
          </p>
        }
      } @else {
        @if (iFrameUrl(); as iFrameUrl) {
          <mat-progress-bar
            class="wolipay-spinner"
            mode="indeterminate"
          ></mat-progress-bar>
          <iframe
            class="payment-card__iframe"
            [src]="iFrameUrl | sanitizeUrl"
          ></iframe>
        } @else if (amountToPay() > 0 && mainQr()) {
          @let qrLink = mainQr()!.link;

          <div class="payment-card__qr-container">
            <div class="payment-card__qr">
              <img
                #qrImage
                alt="QR de pago"
                [hidden]="!qrLoaded()"
                [src]="qrLink"
                (load)="qrLoaded.set(true)"
              />
              @if (!qrLoaded()) {
                <div class="payment-card__qr-skeleton"></div>
              }
              <a mat-button target="_blank" rel="noreferrer" [href]="qrLink">
                Descargar QR
              </a>
            </div>
            <div class="payment-card__qr-upload-box">
              <p>
                <b> Realiza el pago y sube tu(s) comprobante(s). </b>
              </p>
              <combi-upload-box (selectFile)="selectedReceipts.set($event)" />
              <button
                mat-flat-button
                [disabled]="loading() || !selectedReceipts()"
                (click)="uploadReceipts.emit(selectedReceipts())"
              >
                Subir Comprobante(s)
              </button>
            </div>
          </div>
        } @else {
          <mat-progress-bar
            class="wolipay-spinner"
            mode="indeterminate"
          ></mat-progress-bar>
        }
      }
    </div>
  `,
  styles: `
    .payment-card {
      background-color: #fef9fc;
      border-radius: 0.75rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      min-height: 600px;
      padding: 15px;
      position: relative;
      width: 100%;

      .wolipay-spinner {
        position: absolute;
        top: 0.75rem;
        width: 100%;
      }

      .payment-card__iframe {
        border: 0;
        border-radius: 0.75rem;
        height: 100%;
        position: relative;
        width: 100%;
        z-index: 1;
      }

      .payment-card__qr-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        width: 100%;

        .payment-card__qr-upload-box {
          align-items: center;
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 32px;
          justify-content: center;
          max-width: 100%;
        }

        .payment-card__qr {
          align-items: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
          justify-content: center;
          margin: 0 auto;
          max-width: 100%;
          width: 500px;

          img {
            height: auto;
            max-width: 100%;
            width: 400px;
          }

          .payment-card__qr-skeleton {
            animation: skeleton-loading 1s linear infinite alternate;
            aspect-ratio: 1 / 1;
            background-color: #636363;
            max-width: 100%;
            width: 400px;
          }
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCardComponent {
  readonly iFrameUrl = input<string>();
  readonly amountToPay = input.required<number>();
  readonly qrs = input<SimpleQR[]>();
  readonly uploadReceipts = output<File[] | null>();

  protected readonly mainQr = computed(() =>
    this.qrs()?.find((qr) => qr.id === 'main'),
  );
  protected readonly qrLoaded = signal(false);
  protected readonly selectedReceipts = signal<File[] | null>(null);
  protected readonly loading = inject(LoadingState).loading;
}
