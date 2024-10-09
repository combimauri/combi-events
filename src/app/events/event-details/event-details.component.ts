import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subject, switchMap } from 'rxjs';
import { EventRegistrationComponent } from './event-registration/event-registration.component';
import {
  BillingRecord,
  BillingData,
} from '../../core/models/billing-record.model';
import { Event } from '../../core/models/event.model';
import { PaymentsService } from '../../core/services/payments.service';
import { SanitizeUrlPipe } from '../../shared/pipes/sanitize-url.pipe';
import { EventRecordsService } from '../../core/services/event-records.service';
import { PartialEventRecord } from '../../core/models/event-record.model';

@Component({
  selector: 'gdg-event-details',
  standalone: true,
  imports: [EventRegistrationComponent, FormsModule, SanitizeUrlPipe],
  template: `
    @if (event()) {
      <div class="container">
        <gdg-event-registration (submitForm)="register($event)" />

        @if (iFrameUrl()) {
          <iframe
            width="100%"
            height="600"
            [src]="iFrameUrl() | sanitizeUrl"
          ></iframe>
        }
      </div>
    }
  `,
  styles: ``,
})
export default class EventDetailsComponent {
  #billingRecord?: BillingRecord;
  #paymentsService = inject(PaymentsService);
  #eventRecordsService = inject(EventRecordsService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  event = toSignal(
    this.#route.data.pipe(map((data) => data['event'] as Event | undefined)),
  );

  generateToken$ = new Subject<void>();
  token = toSignal(
    this.generateToken$.pipe(
      switchMap(() => this.#paymentsService.generateAuthToken()),
    ),
  );

  getBillingResponse$ = new Subject<{
    token: string;
    billing: BillingRecord;
  }>();
  billingResponse = toSignal(
    this.getBillingResponse$.pipe(
      switchMap(({ token, billing }) =>
        this.#paymentsService.getPaymentIFrame(token, billing),
      ),
    ),
  );

  registerEventRecord$ = new Subject<BillingData>();
  iFrameUrl = toSignal(
    this.registerEventRecord$.pipe(
      switchMap(({ orderId, transactionId }) => {
        const record: PartialEventRecord = {
          email: this.#billingRecord?.email!,
          eventId: this.event()?.id!,
          firstName: this.#billingRecord?.firstName!,
          lastName: this.#billingRecord?.lastName!,
          orderId,
          phoneNumber: this.#billingRecord?.phoneNumber!,
          transactionId,
        };
        return this.#eventRecordsService.registerRecord(record);
      }),
      map(() => this.billingResponse()?.url),
    ),
  );

  constructor() {
    effect(() => this.handleLoadEvent(this.event()));
    effect(() => this.getBillingResponse(this.token()));
    effect(() => this.registerEventRecord(this.billingResponse()));
  }

  register(billingRecord: BillingRecord): void {
    this.#billingRecord = billingRecord;

    this.generateToken$.next();
  }

  private handleLoadEvent(event: Event | undefined): void {
    if (!event) {
      this.#router.navigate(['/events']);
    }
  }

  private getBillingResponse(token: string | undefined): void {
    if (!token || !this.#billingRecord) {
      return;
    }

    this.getBillingResponse$.next({
      token,
      billing: this.#billingRecord,
    });
  }

  private registerEventRecord(billingData: BillingData | undefined): void {
    if (!billingData) {
      return;
    }

    this.registerEventRecord$.next(billingData);
  }
}
