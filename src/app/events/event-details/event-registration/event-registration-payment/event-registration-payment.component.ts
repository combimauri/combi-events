import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingState } from '@core/states';
import { SanitizeUrlPipe } from '@shared/pipes';

@Component({
  selector: 'combi-event-registration-payment',
  standalone: true,
  imports: [MatProgressSpinnerModule, SanitizeUrlPipe],
  template: `
    <div class="event-registration-payment">
      @if (!loading() && !iFrameUrl()) {
        @defer (on timer(2s)) {
          <p>
            Ha ocurrido un error al cargar la pasarela de pago. Por favor,
            inténtalo de nuevo.
          </p>
        }
      } @else {
        <mat-spinner />

        @if (iFrameUrl(); as iFrameUrl) {
          <iframe
            class="event-registration-payment__iframe"
            [src]="iFrameUrl | sanitizeUrl"
          ></iframe>
        }
      }
    </div>
  `,
  styles: `
    .event-registration-payment {
      background-color: #fef9fc;
      border-radius: 0.75rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      height: 600px;
      position: relative;
      width: 100%;

      mat-spinner {
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .event-registration-payment__iframe {
        border: 0;
        border-radius: 0.75rem;
        height: 100%;
        position: relative;
        width: 100%;
        z-index: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationPaymentComponent {
  readonly iFrameUrl = input<string>();
  readonly loading = inject(LoadingState).loading;
}
