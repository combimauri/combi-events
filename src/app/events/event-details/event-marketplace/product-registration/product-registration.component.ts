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
import { BillingRecord, RegistrationStep } from '@core/models';
import { LoggerService, ProductRecordsService } from '@core/services';
import {
  EventRecordState,
  EventState,
  ProductRecordState,
  ProductState,
  RegistrationStepState,
} from '@core/states';
import { PageTitleComponent, PaymentCardComponent } from '@shared/components';
import { filter, Subject, switchMap, tap } from 'rxjs';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductFormComponent } from './product-form/product-form.component';

@Component({
  selector: 'combi-product-registration',
  standalone: true,
  imports: [
    MatCardModule,
    PageTitleComponent,
    PaymentCardComponent,
    ProductDetailsComponent,
    ProductFormComponent,
  ],
  template: `
    @if (product(); as product) {
      <combi-page-title> Adquirir Producto </combi-page-title>

      @switch (registrationStep()) {
        @case (RegistrationStep.form) {
          <combi-product-form
            [eventRecord]="eventRecord()!"
            [product]="product"
            [productRecord]="productRecord()"
            (submitForm)="setBillingRecord($event)"
          />
        }
        @case (RegistrationStep.details) {
          <combi-product-details
            [additionalQuestions]="product.additionalQuestions || []"
            [billingRecord]="billingRecord"
            [eventId]="eventId()!"
            [price]="product.price"
            [product]="product"
            (confirmDetails)="triggerOrderGeneration($event)"
          />
        }
        @case (RegistrationStep.payment) {
          <combi-payment-card [iFrameUrl]="iFrameUrl()" />
        }
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductRegistrationComponent implements OnInit, OnDestroy {
  billingRecord?: BillingRecord;

  readonly #event = inject(EventState).event;
  readonly #logger = inject(LoggerService);
  readonly #productRecordsService = inject(ProductRecordsService);
  readonly #productRecordState = inject(ProductRecordState);
  readonly #registrationStepState = inject(RegistrationStepState);

  readonly #getProductRecord$ = new Subject<string>();
  readonly #triggerPaymentSuccess$ = new Subject<void>();

  readonly #productRecord = this.#productRecordState.productRecord;
  readonly #validatedInitialValue = this.#productRecord()?.validated || false;

  readonly #getBillingData$ = new Subject<{
    eventId: string;
    productId: string;
    billing: BillingRecord;
  }>();
  readonly #billingData = toSignal(
    this.#getBillingData$.pipe(
      switchMap(({ eventId, productId, billing }) =>
        this.#productRecordsService.registerRecord(eventId, productId, billing),
      ),
    ),
  );
  readonly #paymentValidated = computed(
    () => !!this.realtimeProductRecord()?.validated,
  );

  readonly RegistrationStep = RegistrationStep;

  readonly eventRecord = inject(EventRecordState).eventRecord;
  readonly product = inject(ProductState).product;
  readonly productRecord = this.#productRecordState.productRecord;

  readonly eventId = computed(() => this.#event()?.id);
  readonly iFrameUrl = computed(() => this.#billingData()?.url);
  readonly registrationStep = this.#registrationStepState.registrationStep;

  readonly paymentSuccess = toSignal(
    this.#triggerPaymentSuccess$.pipe(tap(() => this.handlePaymentSuccess())),
  );
  readonly realtimeProductRecord = toSignal(
    this.#getProductRecord$.pipe(
      switchMap((id) => this.#productRecordsService.getRealtimeRecordById(id)),
      filter((record) => !!record),
      tap((productRecord) => {
        this.#productRecordState.setProductRecord(productRecord);

        if (!this.#validatedInitialValue && productRecord.validated) {
          this.#triggerPaymentSuccess$.next();
        }
      }),
    ),
  );

  constructor() {
    effect(() => {
      const productRecordId = this.#billingData()?.recordId;

      if (productRecordId && !this.realtimeProductRecord()) {
        this.#getProductRecord$.next(productRecordId);
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
    const productId = this.product()?.id;

    if (!this.billingRecord || !productId) {
      return;
    }

    if (couponId) {
      this.billingRecord.couponId = couponId;
    }

    const billing = this.billingRecord;
    const eventId = this.eventId()!;

    this.#getBillingData$.next({ eventId, productId, billing });
    this.#registrationStepState.setRegistrationStep(RegistrationStep.payment);
  }

  private handlePaymentSuccess(): void {
    this.#logger.handleSuccess('¡Compra validada con éxito!');
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }
}
