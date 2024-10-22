import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { BillingRecord, AppEvent, RegistrationStep } from '@core/models';
import { EventRecordsService } from '@core/services';
import { RegistrationStepState } from '@core/states';
import { BackButtonComponent } from '@shared/components';
import { map, Subject, switchMap } from 'rxjs';
import { EventRegistrationDetailsComponent } from './event-registration-details/event-registration-details.component';
import { EventRegistrationFormComponent } from './event-registration-form/event-registration-form.component';
import { EventRegistrationPaymentComponent } from './event-registration-payment/event-registration-payment.component';

@Component({
  selector: 'combi-event-registration',
  standalone: true,
  imports: [
    BackButtonComponent,
    EventRegistrationDetailsComponent,
    EventRegistrationFormComponent,
    EventRegistrationPaymentComponent,
    MatCardModule,
  ],
  template: `
    <div
      [class.event-registration__small-width]="
        [RegistrationStep.form, RegistrationStep.details].includes(
          registrationStep()
        )
      "
    >
      <mat-card appearance="outlined">
        <mat-card-content class="page-title">
          <combi-back-button />
          <h4>Registrarse a: {{ title() }}</h4>
        </mat-card-content>
      </mat-card>
    </div>

    @switch (registrationStep()) {
      @case (RegistrationStep.form) {
        <div class="event-registration__small-width">
          <combi-event-registration-form
            [additionalQuestions]="
              event()?.registrationAdditionalQuestions || []
            "
            [billingRecord]="billingRecord"
            [price]="event()?.price"
            (submitForm)="setBillingRecord($event)"
          />
        </div>
      }
      @case (RegistrationStep.details) {
        <div class="event-registration__small-width">
          <combi-event-registration-details
            [additionalQuestions]="
              event()?.registrationAdditionalQuestions || []
            "
            [billingRecord]="billingRecord"
            [price]="event()?.price"
            (confirmDetails)="triggerOrderGeneration()"
          />
        </div>
      }
      @case (RegistrationStep.payment) {
        <combi-event-registration-payment
          [iFrameUrl]="iFrameUrl()"
          [realtimeEventRecord]="realtimeEventRecord()"
        />
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-registration__small-width {
      margin: 0 auto;

      @media (min-width: 960px) {
        max-width: 640px;
        width: 75%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventRegistrationComponent implements OnInit, OnDestroy {
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #getEventRecord$ = new Subject<string>();
  readonly #registrationStepState = inject(RegistrationStepState);
  readonly #route = inject(ActivatedRoute);

  readonly #getBillingData$ = new Subject<{
    eventId: string;
    billing: BillingRecord;
  }>();
  readonly #billingData = toSignal(
    this.#getBillingData$.pipe(
      switchMap(({ eventId, billing }) =>
        this.#eventRecordsService.registerRecord(eventId, billing),
      ),
    ),
  );

  billingRecord?: BillingRecord;

  readonly RegistrationStep = RegistrationStep;

  readonly iFrameUrl = computed(() => this.#billingData()?.url);
  readonly registrationStep = this.#registrationStepState.registrationStep;
  readonly title = computed(() => this.event()?.name);

  readonly event = toSignal(
    this.#route.parent!.data.pipe(
      map((data) => data['event'] as AppEvent | undefined),
    ),
  );
  readonly realtimeEventRecord = toSignal(
    this.#getEventRecord$.pipe(
      switchMap((id) => this.#eventRecordsService.getRealtimeRecordById(id)),
    ),
  );

  constructor() {
    effect(() => {
      const eventRecordId = this.#billingData()?.eventRecordId;

      if (eventRecordId) {
        this.#getEventRecord$.next(eventRecordId);
      }
    });
  }

  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !!this.realtimeEventRecord()?.validated;
  }

  ngOnInit(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  ngOnDestroy(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  setBillingRecord(billingRecord: BillingRecord): void {
    this.billingRecord = billingRecord;

    this.#registrationStepState.setRegistrationStep(RegistrationStep.details);
  }

  triggerOrderGeneration(): void {
    const eventId = this.event()?.id;

    if (!this.billingRecord || !eventId) {
      return;
    }

    this.#getBillingData$.next({ eventId, billing: this.billingRecord });
    this.#registrationStepState.setRegistrationStep(RegistrationStep.payment);
  }
}
