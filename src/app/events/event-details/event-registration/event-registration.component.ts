import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, of, Subject, switchMap } from 'rxjs';
import { EventRegistrationFormComponent } from './event-registration-form/event-registration-form.component';
import {
  BillingRecord,
  BillingData,
} from '../../../core/models/billing-record.model';
import {
  EventRecord,
  PartialEventRecord,
} from '../../../core/models/event-record.model';
import { EventRecordsService } from '../../../core/services/event-records.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { SanitizeUrlPipe } from '../../../shared/pipes/sanitize-url.pipe';

@Component({
  selector: 'gdg-event-registration',
  standalone: true,
  imports: [EventRegistrationFormComponent, SanitizeUrlPipe],
  template: `
    @if (iFrameUrl()) {
      <iframe
        class="event-registration__wolipay"
        [src]="iFrameUrl() | sanitizeUrl"
      ></iframe>
    } @else {
      <div class="event-registration__form">
        <gdg-event-registration-form (submitForm)="register($event)" />
      </div>
    }
  `,
  styles: `
    .event-registration__wolipay {
      border-radius: 0.75rem;
      border: 0;
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
})
export default class EventRegistrationComponent {
  #billingRecord?: BillingRecord;
  #paymentsService = inject(PaymentsService);
  #eventRecordsService = inject(EventRecordsService);
  #route = inject(ActivatedRoute);

  eventId = toSignal(
    this.#route.parent!.params.pipe(map((params) => params['id'])),
  );

  generateToken$ = new Subject<void>();
  token = toSignal(
    this.generateToken$.pipe(
      switchMap(() => this.#paymentsService.generateAuthToken()),
    ),
  );

  getBillingData$ = new Subject<{
    token: string;
    billing: BillingRecord;
  }>();
  billingData = toSignal(
    this.getBillingData$.pipe(
      switchMap(({ token, billing }) =>
        this.#paymentsService.getBillingData(token, billing),
      ),
      switchMap((data) => this.registerEventRecord(data).pipe(map(() => data))),
    ),
  );
  iFrameUrl = computed(() => this.billingData()?.url);

  constructor() {
    effect(() => this.getBillingResponse(this.token()));
    effect(() => this.registerEventRecord(this.billingData()));
  }

  register(billingRecord: BillingRecord): void {
    this.#billingRecord = billingRecord;

    this.generateToken$.next();
  }

  private getBillingResponse(token: string | undefined): void {
    if (!token || !this.#billingRecord) {
      return;
    }

    this.getBillingData$.next({
      token,
      billing: this.#billingRecord,
    });
  }

  private registerEventRecord(
    billingData: BillingData | undefined,
  ): Observable<EventRecord | null> {
    if (!billingData) {
      return of(null);
    }

    const { orderId, transactionId } = billingData;

    const record: PartialEventRecord = {
      email: this.#billingRecord?.email!,
      eventId: this.eventId()!,
      firstName: this.#billingRecord?.firstName!,
      lastName: this.#billingRecord?.lastName!,
      orderId,
      phoneNumber: this.#billingRecord?.phoneNumber!,
      transactionId,
    };

    return this.#eventRecordsService.registerRecord(record);
  }
}
