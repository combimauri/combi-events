import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '@angular/fire/auth';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  AdditionalQuestion,
  BillingRecord,
  EventRecord,
  Price,
} from '@core/models';
import { AuthService } from '@core/services';
import { LoadingState, EventRecordState } from '@core/states';

@Component({
  selector: 'combi-event-registration-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <form #eventForm="ngForm" (ngSubmit)="register()">
      @if (price(); as price) {
        <mat-card appearance="outlined">
          <mat-card-content class="event-registration-form__price">
            <p>
              @if (price.amount) {
                Una vez completes el formulario, deberás pagar
                <b>
                  {{ price.amount - price.discount }}
                  {{ price.currency }}
                </b>
                para confirmar tu registro.
              } @else {
                Completa tus datos.
              }
            </p>
          </mat-card-content>
        </mat-card>
      }

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <p>Nombre Completo</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Tu respuesta</mat-label>
            <input
              matInput
              required
              cdkFocusInitial
              type="text"
              id="fullName"
              name="fullName"
              [disabled]="loading()"
              [ngModel]="fullName()"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      @for (question of answeredQuestions(); track question.key) {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>
              <p>
                {{ question.label }}
              </p>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field>
              <mat-label>Tu respuesta</mat-label>
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
                  >
                    <mat-option value=""></mat-option>
                    @for (option of question.options; track option) {
                      <mat-option [value]="option">
                        {{ option }}
                      </mat-option>
                    }
                  </mat-select>
                }
              }
            </mat-form-field>
          </mat-card-content>
        </mat-card>
      }

      <button
        mat-fab
        extended
        type="submit"
        [disabled]="eventForm.invalid || loading()"
      >
        Revisar Detalles
      </button>
    </form>
  `,
  styles: `
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      mat-card-title p {
        font-size: 1rem;
      }

      mat-form-field {
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationFormComponent {
  readonly #eventRecord = inject(EventRecordState).eventRecord;
  readonly #user = toSignal(inject(AuthService).user$, { initialValue: null });

  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly billingRecord = input<BillingRecord>();
  readonly eventForm = viewChild.required(NgForm);
  readonly loading = inject(LoadingState).loading;
  readonly price = input<Price>();
  readonly submitForm = output<BillingRecord>();

  fullName = computed(() =>
    this.mapFullName(this.billingRecord(), this.#eventRecord(), this.#user()),
  );
  answeredQuestions = computed(() =>
    this.mapQuestions(
      this.billingRecord(),
      this.additionalQuestions(),
      this.#eventRecord(),
    ),
  );

  register(): void {
    this.trimValues();

    if (this.eventForm().invalid) {
      return;
    }

    const formValue = this.eventForm().value;
    const email = this.#user()?.email!;
    const { fullName } = formValue;

    delete formValue.fullName;

    const billingRecord: BillingRecord = {
      email,
      fullName,
      additionalAnswers: { ...formValue },
    };

    this.submitForm.emit(billingRecord);
  }

  private mapFullName(
    billingRecord: BillingRecord | undefined,
    eventRecord: EventRecord | null,
    user: User | null,
  ): string {
    return (
      billingRecord?.fullName ||
      eventRecord?.fullName ||
      user?.displayName ||
      ''
    );
  }

  private mapQuestions(
    billingRecord: BillingRecord | undefined,
    questions: AdditionalQuestion[],
    eventRecord: EventRecord | null,
  ): AdditionalQuestion[] {
    const answers =
      billingRecord?.additionalAnswers || eventRecord?.additionalAnswers;

    if (!answers) {
      return questions;
    }

    for (const question of questions) {
      question.answer = answers[question.key] ?? '';
    }

    return questions;
  }

  private trimValues(): void {
    const formValue = this.eventForm().value;

    for (const key in formValue) {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim();
      }
    }

    this.eventForm().setValue(formValue);
  }
}
