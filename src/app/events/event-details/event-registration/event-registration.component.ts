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
import { ActivatedRoute, Router } from '@angular/router';
import { BillingRecord, RegistrationStep } from '@core/models';
import { EventRecordsService, LoggerService } from '@core/services';
import {
  EventRecordState,
  EventState,
  RegistrationStepState,
} from '@core/states';
import { PageTitleComponent, PaymentCardComponent } from '@shared/components';
import { filter, Subject, switchMap, tap } from 'rxjs';
import { EventRegistrationDetailsComponent } from './event-registration-details/event-registration-details.component';
import { EventRegistrationFormComponent } from './event-registration-form/event-registration-form.component';

@Component({
  selector: 'combi-event-registration',
  standalone: true,
  imports: [
    EventRegistrationDetailsComponent,
    EventRegistrationFormComponent,
    PageTitleComponent,
    PaymentCardComponent,
  ],
  template: `
    <div
      [class.event-registration__small-width]="
        [RegistrationStep.form, RegistrationStep.details].includes(
          registrationStep()
        )
      "
    >
      <combi-page-title> Registrarse a: {{ title() }} </combi-page-title>
    </div>

    @switch (registrationStep()) {
      @case (RegistrationStep.form) {
        <div class="event-registration__small-width">
          <combi-event-registration-form
            [additionalQuestions]="event()?.additionalQuestions || []"
            [billingRecord]="billingRecord"
            [price]="event()?.price"
            (submitForm)="setBillingRecord($event)"
          />
        </div>
      }
      @case (RegistrationStep.details) {
        <div class="event-registration__small-width">
          <combi-event-registration-details
            [additionalQuestions]="event()?.additionalQuestions || []"
            [billingRecord]="billingRecord"
            [eventId]="event()?.id!"
            [price]="event()?.price"
            (confirmDetails)="triggerOrderGeneration($event)"
          />
        </div>
      }
      @case (RegistrationStep.payment) {
        <combi-payment-card [iFrameUrl]="iFrameUrl()" />
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
  billingRecord?: BillingRecord;

  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #eventRecordState = inject(EventRecordState);
  readonly #eventRecord = this.#eventRecordState.eventRecord;
  readonly #getEventRecord$ = new Subject<string>();
  readonly #logger = inject(LoggerService);
  readonly #registrationStepState = inject(RegistrationStepState);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

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
  readonly #paymentValidated = computed(
    () => !!this.realtimeEventRecord()?.validated,
  );

  readonly RegistrationStep = RegistrationStep;

  readonly event = inject(EventState).event;
  readonly iFrameUrl = computed(() => this.#billingData()?.url);
  readonly registrationStep = this.#registrationStepState.registrationStep;
  readonly title = computed(() => this.event()?.name);

  readonly realtimeEventRecord = toSignal(
    this.#getEventRecord$.pipe(
      switchMap((id) => this.#eventRecordsService.getRealtimeRecordById(id)),
      filter((record) => !!record),
      tap((eventRecord) => this.#eventRecordState.setEventRecord(eventRecord)),
    ),
  );

  constructor() {
    effect(() => {
      const eventRecordId =
        this.#eventRecord()?.id || this.#billingData()?.recordId;

      if (eventRecordId && !this.realtimeEventRecord()) {
        this.#getEventRecord$.next(eventRecordId);
      }
    });
    effect(() => {
      if (this.#paymentValidated()) {
        this.#logger.handleSuccess('¡Registro validado con éxito!');
        this.#router.navigate(['..'], { relativeTo: this.#route });
      }
    });
  }

  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return this.#paymentValidated();
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

  triggerOrderGeneration(couponId: string | null): void {
    const eventId = this.event()?.id;

    if (!this.billingRecord || !eventId) {
      return;
    }

    if (couponId) {
      this.billingRecord.couponId = couponId;
    }

    this.#getBillingData$.next({ eventId, billing: this.billingRecord });
    this.#registrationStepState.setRegistrationStep(RegistrationStep.payment);
  }
}
