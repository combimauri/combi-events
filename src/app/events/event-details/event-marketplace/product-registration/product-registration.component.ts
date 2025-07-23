import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { getDownloadURL, UploadTask } from '@angular/fire/storage';
import { MatCardModule } from '@angular/material/card';
import { BillingRecord, RegistrationStep } from '@core/models';
import {
  LoggerService,
  PaymentsService,
  ProductRecordsService,
} from '@core/services';
import {
  EventRecordState,
  EventState,
  LoadingState,
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
          <!-- TODO: Take into consideration coupon for amountToPay -->
          <combi-payment-card
            [iFrameUrl]="iFrameUrl()"
            [amountToPay]="product.price.amount - product.price.discount"
            [qrs]="product.price.qrs"
            (uploadReceipts)="uploadPaymentReceipts($event)"
          />
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
  readonly #loadingState = inject(LoadingState);
  readonly #logger = inject(LoggerService);
  readonly #paymentsService = inject(PaymentsService);
  readonly #productRecordsService = inject(ProductRecordsService);
  readonly #productRecordState = inject(ProductRecordState);
  readonly #registrationStepState = inject(RegistrationStepState);

  readonly #getProductRecord$ = new Subject<string>();
  readonly #triggerPaymentSuccess$ = new Subject<void>();

  readonly #selectedFiles = signal<File[]>([]);
  readonly #uploadedFilesLinks = signal<string[]>([]);

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
        // This is only for paid products
        this.#productRecordsService.registerSimpleRecord(
          eventId,
          productId,
          billing,
        ),
      ),
    ),
  );
  readonly #paymentValidated = computed(
    () => !!this.realtimeProductRecord()?.validated,
  );
  readonly #hasPaymentReceipts = computed(
    () => !!this.realtimeProductRecord()?.paymentReceipts?.length,
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

  readonly #triggerAssociateReceipt$ = new Subject<{
    productRecordId: string;
    links: string[];
  }>();
  readonly handleAssociateReceipt = toSignal(
    this.#triggerAssociateReceipt$.pipe(
      switchMap(({ productRecordId, links }) => {
        this.#logger.handleInfo(
          'Los comprobantes de pago se guardaron con éxito.',
        );

        return this.#productRecordsService.associateMainPaymentReceipt(
          productRecordId,
          links,
        );
      }),
    ),
  );

  protected readonly registerReceiptsLinksIntoEventRecord = effect(() => {
    const selectedFiles = [...this.#selectedFiles()];
    const links = [...this.#uploadedFilesLinks()];

    if (!selectedFiles.length) {
      return;
    }

    if (selectedFiles.length === links.length) {
      untracked(() => {
        const productRecord = this.#productRecord();

        if (!productRecord) {
          return;
        }

        const { id: productRecordId } = productRecord;

        this.#triggerAssociateReceipt$.next({ productRecordId, links });
      });
    }
  });

  constructor() {
    effect(() => {
      const productRecordId = this.#billingData()?.recordId;

      if (productRecordId && !this.realtimeProductRecord()) {
        this.#getProductRecord$.next(productRecordId);
      }
    });
    effect(() => {
      if (this.#hasPaymentReceipts()) {
        this.#logger.handleInfo(
          '¡Tu(s) comprobante(s) de pago fue(ron) registrado(s)!',
        );

        untracked(() => {
          const productRecordId = this.#billingData()?.recordId;
          this.#productRecordsService.sendPaymentReceiptEmail(productRecordId);
          this.#registrationStepState.setRegistrationStep(
            RegistrationStep.form,
          );
        });
      }
    });
  }

  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return this.#paymentValidated() || this.#hasPaymentReceipts();
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

  uploadPaymentReceipts(files: File[] | null): void {
    const productRecord = this.#productRecord();

    if (!productRecord || !files || !files.length) {
      return;
    }

    const { id } = productRecord;

    this.#uploadedFilesLinks.set([]);
    this.#selectedFiles.set(files);
    this.#selectedFiles().forEach((file) => {
      const uploadTask = this.#paymentsService.uploadProductPaymentReceipt(
        id,
        file,
      );

      this.handleReceiptUpload(uploadTask);
    });
  }

  private handlePaymentSuccess(): void {
    this.#logger.handleInfo('¡Compra validada con éxito!');
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  private handleReceiptUpload(uploadTask: UploadTask): void {
    this.#loadingState.startLoading();
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        this.#logger.handleError(error);
        this.#loadingState.stopLoading();
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((link) =>
          this.#uploadedFilesLinks.set([...this.#uploadedFilesLinks(), link]),
        );
        this.#loadingState.stopLoading();
      },
    );
  }
}
