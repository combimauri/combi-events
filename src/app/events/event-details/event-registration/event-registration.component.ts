import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  BillingData,
  BillingRecord,
  AppEvent,
  EventRecord,
  PartialEventRecord,
} from '@core/models';
import { EventRecordsService, PaymentsService } from '@core/services';
import { SanitizeUrlPipe } from '@shared/pipes';
import { map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { EventRegistrationFormComponent } from './event-registration-form/event-registration-form.component';
import { EventRegistrationPaymentComponent } from './event-registration-payment/event-registration-payment.component';

@Component({
  selector: 'combi-event-registration',
  standalone: true,
  imports: [
    EventRegistrationFormComponent,
    EventRegistrationPaymentComponent,
    SanitizeUrlPipe,
  ],
  template: `
    @if (iFrameUrl(); as iFrameUrl) {
      <combi-event-registration-payment
        [iFrameUrl]="iFrameUrl"
        [realtimeEventRecord]="realtimeEventRecord()"
      />
    } @else {
      <div class="event-registration__form">
        <combi-event-registration-form
          [additionalQuestions]="event()?.registrationAdditionalQuestions || []"
          (submitForm)="register($event)"
        />
      </div>
    }
  `,
  styles: `
    .event-registration__form {
      margin: 0 auto;

      @media (min-width: 960px) {
        max-width: 640px;
        width: 75%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventRegistrationComponent {
  readonly #paymentsService = inject(PaymentsService);
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #route = inject(ActivatedRoute);
  readonly #generateToken$ = new Subject<void>();
  readonly #token = toSignal(
    this.#generateToken$.pipe(
      switchMap(() => this.#paymentsService.generateAuthToken()),
    ),
  );
  readonly #getEventRecord$ = new Subject<string>();
  readonly #getBillingData$ = new Subject<{
    token: string;
    billing: BillingRecord;
    event: AppEvent;
  }>();
  readonly #billingData = toSignal(
    this.#getBillingData$.pipe(
      switchMap(({ token, billing, event }) =>
        this.#paymentsService.getBillingData(token, billing, event),
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

  #billingRecord?: BillingRecord;

  readonly event = toSignal(
    this.#route.parent!.data.pipe(
      map((data) => data['event'] as AppEvent | undefined),
    ),
  );
  readonly iFrameUrl = computed(() => this.#billingData()?.url);
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

  register(billingRecord: BillingRecord): void {
    this.#billingRecord = billingRecord;

    this.#generateToken$.next();
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
        billing: this.#billingRecord!,
        event,
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
      email: this.#billingRecord?.email!,
      eventId: this.event()!.id,
      fullName: this.#billingRecord?.fullName!,
      orderId,
      phoneNumber: this.#billingRecord?.phoneNumber!,
      paymentId,
      additionalAnswers: this.#billingRecord?.additionalAnswers!,
    };

    return this.#eventRecordsService.registerRecord(record);
  }
}
