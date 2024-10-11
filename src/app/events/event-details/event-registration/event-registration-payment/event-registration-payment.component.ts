import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventRecord } from '../../../../core/models/event-record.model';
import { LoggerService } from '../../../../core/services/logger.service';
import { SanitizeUrlPipe } from '../../../../shared/pipes/sanitize-url.pipe';

@Component({
  selector: 'combi-event-registration-payment',
  standalone: true,
  imports: [SanitizeUrlPipe],
  template: `
    <iframe
      class="event-registration-payment"
      [src]="iFrameUrl() | sanitizeUrl"
    ></iframe>
  `,
  styles: `
    .event-registration-payment {
      border: 0;
      border-radius: 0.75rem;
      height: 100%;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationPaymentComponent {
  readonly iFrameUrl = input.required<string>();
  readonly realtimeEventRecord = input<EventRecord>();

  readonly #logger = inject(LoggerService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #paymentValidated = computed(
    () => this.realtimeEventRecord()?.validated,
  );

  constructor() {
    effect(() => {
      if (this.#paymentValidated()) {
        this.#logger.handleSuccess('¡Pago comprobado con éxito!');
        this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
      }
    });
  }
}
