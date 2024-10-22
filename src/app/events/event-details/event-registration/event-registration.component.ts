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
import {
  BillingData,
  BillingRecord,
  AppEvent,
  EventRecord,
  PartialEventRecord,
  Price,
  RegistrationStep,
} from '@core/models';
import { EventRecordsService, PaymentsService } from '@core/services';
import { RegistrationStepState } from '@core/states';
import { BackButtonComponent } from '@shared/components';
import { SanitizeUrlPipe } from '@shared/pipes';
import { map, Observable, of, Subject, switchMap, tap } from 'rxjs';
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
    SanitizeUrlPipe,
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
  readonly #generateToken$ = new Subject<void>();
  readonly #getEventRecord$ = new Subject<string>();
  readonly #paymentsService = inject(PaymentsService);
  readonly #registrationStepState = inject(RegistrationStepState);
  readonly #route = inject(ActivatedRoute);

  readonly #getBillingData$ = new Subject<{
    token: string;
    billing: BillingRecord;
    title: string;
    price: Price;
  }>();
  readonly #token = toSignal(
    this.#generateToken$.pipe(
      switchMap(() => this.#paymentsService.generateAuthToken()),
    ),
  );
  readonly #billingData = toSignal(
    this.#getBillingData$.pipe(
      switchMap(({ token, billing, title, price }) =>
        this.#paymentsService.getBillingData(token, billing, title, price),
      ),
      switchMap((data) =>
        this.registerEventRecord(data).pipe(
          tap(
            (eventRecord) =>
              eventRecord && this.#getEventRecord$.next(eventRecord.id),
          ),
          map(() => data),
        ),
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
    effect(() => this.getBillingResponse(this.#token(), this.event()));
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
    if (!this.billingRecord) {
      return;
    }

    this.#generateToken$.next();
    this.#registrationStepState.setRegistrationStep(RegistrationStep.payment);
  }

  private getBillingResponse(
    token: string | undefined,
    event: AppEvent | undefined,
  ): void {
    if (!token || !event) {
      return;
    }

    // queueMicrotask is used to ensure the next event loop is used
    queueMicrotask(() =>
      this.#getBillingData$.next({
        token,
        billing: this.billingRecord!,
        title: event.name,
        price: event.price,
      }),
    );
  }

  private registerEventRecord(
    billingData: BillingData | undefined,
  ): Observable<EventRecord | undefined> {
    if (!billingData) {
      return of(undefined);
    }

    const { orderId, paymentId } = billingData;

    const record: PartialEventRecord = {
      email: this.billingRecord?.email!,
      eventId: this.event()!.id,
      fullName: this.billingRecord?.fullName!,
      orderId,
      phoneNumber: this.billingRecord?.phoneNumber!,
      paymentId,
      additionalAnswers: this.billingRecord?.additionalAnswers!,
    };

    return this.#eventRecordsService.registerRecord(record);
  }
}
