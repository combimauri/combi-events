import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { EventRegistrationFormComponent } from './event-registration-form/event-registration-form.component';
import { EventRegistrationPaymentComponent } from './event-registration-payment/event-registration-payment.component';
import {
  BillingRecord,
  BillingData,
} from '../../../core/models/billing-record.model';
import { Event } from '../../../core/models/event.model';
import {
  EventRecord,
  PartialEventRecord,
} from '../../../core/models/event-record.model';
import { EventRecordsService } from '../../../core/services/event-records.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { SanitizeUrlPipe } from '../../../shared/pipes/sanitize-url.pipe';

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
      <div class="event-registration__payment">
        <combi-event-registration-payment
          [iFrameUrl]="iFrameUrl"
          [realtimeEventRecord]="realtimeEventRecord()"
        />
      </div>
    } @else {
      <div class="event-registration__form">
        <combi-event-registration-form (submitForm)="register($event)" />
      </div>
    }
  `,
  styles: `
    .event-registration__payment {
      border-radius: 0.75rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      height: 600px;
      width: 100%;
    }

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
  #billingRecord?: BillingRecord;
  readonly #paymentsService = inject(PaymentsService);
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #route = inject(ActivatedRoute);

  readonly #event = toSignal(
    this.#route.parent!.data.pipe(
      map((data) => data['event'] as Event | undefined),
    ),
  );

  readonly #generateToken$ = new Subject<void>();
  readonly #token = toSignal(
    this.#generateToken$.pipe(
      switchMap(() => this.#paymentsService.generateAuthToken()),
    ),
  );

  readonly #getBillingData$ = new Subject<{
    token: string;
    billing: BillingRecord;
    event: Event;
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
  readonly iFrameUrl = computed(() => this.#billingData()?.url);

  readonly #getEventRecord$ = new Subject<string>();
  readonly realtimeEventRecord = toSignal(
    this.#getEventRecord$.pipe(
      switchMap((id) => this.#eventRecordsService.getRealtimeRecordById(id)),
    ),
  );

  constructor() {
    effect(() => this.getBillingResponse(this.#token(), this.#event()));
  }

  register(billingRecord: BillingRecord): void {
    this.#billingRecord = billingRecord;

    this.#generateToken$.next();
  }

  private getBillingResponse(
    token: string | undefined,
    event: Event | undefined,
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
      eventId: this.#event()!.id,
      firstName: this.#billingRecord?.firstName!,
      lastName: this.#billingRecord?.lastName!,
      orderId,
      phoneNumber: this.#billingRecord?.phoneNumber!,
      paymentId,
    };

    return this.#eventRecordsService.registerRecord(record);
  }
}
