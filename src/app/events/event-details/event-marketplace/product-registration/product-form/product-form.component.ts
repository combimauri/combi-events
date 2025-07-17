import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  BillingRecord,
  EventRecord,
  Product,
  ProductRecord,
} from '@core/models';
import { LoadingState } from '@core/states';
import { QuestionLabelPipe } from '@shared/pipes';

@Component({
  selector: 'combi-product-form',
  standalone: true,
  imports: [
    FormsModule,
    KeyValuePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    QuestionLabelPipe,
  ],
  template: `
    <mat-card appearance="outlined" class="product-form">
      <div class="product-form__image">
        <img
          [src]="product().image"
          [alt]="product().name"
          [hidden]="!imageLoaded()"
          (load)="imageLoaded.set(true)"
        />
        @if (!imageLoaded()) {
          <div class="product-form__image-skeleton"></div>
        }
      </div>
      <div class="product-form__data">
        <h4>{{ product().name }}</h4>
        <p>
          {{ product().description }}
        </p>
        <p>{{ product().price.amount }} {{ product().price.currency }}</p>

        @if (validated() || hasPaymentReceipt()) {
          <span class="product-form__separator"></span>
          @if (validated()) {
            <p class="product-form__success">
              <b>¡Felicidades! Ya adquiriste este producto.</b>
              Recibirás instrucciones por parte de los organizadores del evento
              para poder recibirlo.
            </p>
          } @else {
            <p class="product-form__info">
              <b>Tu comprobante de pago pasó a revisión.</b>
              Tu producto fue reservado y muy pronto tu pago será validado.
            </p>
          }

          @let answers = productRecord()?.additionalAnswers || [] | keyvalue;

          @if (answers?.length) {
            <span class="product-form__separator"></span>

            <p>
              <b>Información del producto adquirido</b>
            </p>

            @for (item of answers; track item.key) {
              <p>
                <b
                  >{{
                    item.key | questionLabel: product().additionalQuestions
                  }}:</b
                >
                {{ item.value || 'N/A' }}
              </p>
            }
          }
        } @else {
          <span class="product-form__separator"></span>
          <form #productForm="ngForm" (ngSubmit)="submitInfo()">
            @for (
              question of product().additionalQuestions;
              track question.key
            ) {
              <mat-form-field appearance="outline" class="dense-2">
                <mat-label>{{ question.label }}</mat-label>
                @switch (question.type) {
                  @case ('text') {
                    <input
                      matInput
                      type="text"
                      [id]="question.key"
                      [name]="question.key"
                      [disabled]="loading()"
                      [required]="question.required"
                      [ngModel]="question.answer"
                    />
                  }
                  @case ('select') {
                    <mat-select
                      [id]="question.key"
                      [name]="question.key"
                      [disabled]="loading()"
                      [required]="question.required"
                      [ngModel]="question.answer"
                      [multiple]="question.multiple"
                    >
                      @if (!question.multiple && !question.required) {
                        <mat-option value=""></mat-option>
                      }
                      @for (option of question.options; track option) {
                        <mat-option [value]="option">
                          {{ option }}
                        </mat-option>
                      }
                    </mat-select>
                  }
                }
              </mat-form-field>
            }
            <button
              mat-flat-button
              type="submit"
              [disabled]="productForm.invalid || loading()"
            >
              Revisar Detalles
            </button>
          </form>
        }
      </div>
    </mat-card>
  `,
  styles: `
    .product-form {
      display: flex;
      flex-direction: column;

      @media (min-width: 600px) {
        flex-direction: row;
      }

      .product-form__image {
        width: 100%;

        img {
          border-radius: 10px;
          object-fit: cover;
          width: 100%;
        }

        .product-form__image-skeleton {
          animation: skeleton-loading 1s linear infinite alternate;
          aspect-ratio: 1 / 1;
          background-color: #636363;
          border-radius: 10px;
          width: 100%;
        }

        @media (min-width: 600px) {
          width: 60%;
          height: auto;
        }
      }

      .product-form__data {
        width: 100%;
        padding: 1rem;

        @media (min-width: 600px) {
          width: 40%;
        }

        mat-form-field,
        button {
          width: 100%;
        }

        .product-form__separator {
          display: block;
          height: 2rem;
        }

        .product-form__success {
          background-color: #f0f0f0;
          border-left: 4px solid #4caf50;
          color: #4caf50;
          padding: 1rem;
        }

        .product-form__info {
          background-color: #f0f0f0;
          border-left: 4px solid #fded16;
          color: #000000;
          padding: 1rem;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  readonly eventRecord = input.required<EventRecord>();
  readonly product = input.required<Product>();
  readonly productRecord = input<ProductRecord | null>(null);
  readonly submitForm = output<BillingRecord>();

  protected readonly loading = inject(LoadingState).loading;
  protected readonly productForm = viewChild.required(NgForm);
  protected readonly imageLoaded = signal(false);
  protected readonly validated = computed(
    () => this.productRecord()?.validated || false,
  );
  protected readonly hasPaymentReceipt = computed(
    () => this.productRecord()?.paymentReceipts || false,
  );

  submitInfo(): void {
    if (this.productForm().invalid) {
      return;
    }

    const formValue = this.productForm().value;
    const { email, fullName } = this.eventRecord();

    const billingRecord: BillingRecord = {
      email,
      fullName,
      additionalAnswers: { ...formValue },
    };

    this.submitForm.emit(billingRecord);
  }
}
