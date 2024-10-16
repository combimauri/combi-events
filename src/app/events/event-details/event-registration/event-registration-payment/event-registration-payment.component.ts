import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { EventRecord, RegistrationStep } from '@core/models';
import { LoggerService } from '@core/services';
import { RegistrationStepState } from '@core/states';
import { BackButtonComponent } from '@shared/components';
import { SanitizeUrlPipe } from '@shared/pipes';

@Component({
  selector: 'combi-event-registration-payment',
  standalone: true,
  imports: [BackButtonComponent, MatCardModule, SanitizeUrlPipe],
  template: `
    <mat-card>
      <mat-card-content class="page-title">
        <combi-back-button />
        <h6>Pasarela de Pago</h6>
      </mat-card-content>
    </mat-card>

    <div class="event-registration-payment">
      <iframe
        class="event-registration-payment__iframe"
        [src]="iFrameUrl() | sanitizeUrl"
      ></iframe>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-registration-payment {
      border-radius: 0.75rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      height: 600px;
      width: 100%;

      .event-registration-payment__iframe {
        border: 0;
        border-radius: 0.75rem;
        height: 100%;
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationPaymentComponent implements OnInit {
  readonly iFrameUrl = input.required<string>();
  readonly realtimeEventRecord = input<EventRecord>();

  readonly #registrationStepState = inject(RegistrationStepState);
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

  ngOnInit(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.payment);
  }
}
