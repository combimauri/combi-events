import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatSelectModule,
    QuestionLabelPipe,
  ],
  template: `
    <mat-card appearance="outlined" class="product-form">
      <div class="product-form__image">
        <img [src]="product().image" [alt]="product().name" />
      </div>
      <div class="product-form__data">
        <h4>{{ product().name }}</h4>
        <p>
          {{ product().description }}
        </p>
        <p>{{ product().price.amount }} {{ product().price.currency }}</p>

        @if (validated()) {
          <span class="product-form__separator"></span>
          <p class="product-form__success">
            <b>¡Felicidades! Ya adquiriste este producto.</b>
            Podrás recogerlo el día del evento.
          </p>

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
                  @case ('select') {
                    <mat-select
                      [id]="question.key"
                      [name]="question.key"
                      [disabled]="loading()"
                      [required]="question.required"
                      [ngModel]="question.answer"
                    >
                      @if (!question.required) {
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
          height: 100%;
          object-fit: cover;
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
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  readonly eventRecord = input.required<EventRecord>();
  readonly loading = inject(LoadingState).loading;
  readonly product = input.required<Product>();
  readonly productForm = viewChild.required(NgForm);
  readonly productRecord = input<ProductRecord | null>(null);
  readonly submitForm = output<BillingRecord>();
  readonly validated = computed(() => this.productRecord()?.validated || false);

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
