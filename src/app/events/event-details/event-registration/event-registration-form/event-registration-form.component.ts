import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
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
import { map, of, Subject, switchMap } from 'rxjs';

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
        @if (question.visible) {
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>
                <p [innerHTML]="question.label"></p>
              </mat-card-title>
              @if (question.description) {
                <mat-card-subtitle>
                  <p [innerHTML]="question.description"></p>
                </mat-card-subtitle>
              }
            </mat-card-header>
            @if (question.type !== 'info') {
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
              </mat-card-content>
            }
          </mat-card>
        }
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

      mat-card-subtitle p {
        font-size: 0.875rem;
      }

      mat-form-field {
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRegistrationFormComponent implements AfterViewInit {
  readonly #eventRecord = inject(EventRecordState).eventRecord;
  readonly #user = toSignal(inject(AuthService).user$, { initialValue: null });
  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly finalAdditionalQuestions = signal<AdditionalQuestion[]>([]);
  readonly billingRecord = input<BillingRecord>();
  readonly eventForm = viewChild.required(NgForm);
  readonly loading = inject(LoadingState).loading;
  readonly price = input<Price>();
  readonly submitForm = output<BillingRecord>();

  readonly fullName = computed(() =>
    this.mapFullName(this.billingRecord(), this.#eventRecord(), this.#user()),
  );
  readonly answeredQuestions = computed(() =>
    this.mapQuestions(
      this.billingRecord(),
      this.#eventRecord(),
      this.finalAdditionalQuestions(),
    ),
  );
  readonly #afterViewInit$ = new Subject<void>();
  readonly #eventFormValueChanges = toSignal(
    this.#afterViewInit$.pipe(
      switchMap(() => this.eventForm().valueChanges || of(null)),
    ),
  );

  readonly mapVisibleAdditionalQuestions = effect(() => {
    // TODO: Watch only fields with dependencies changes.
    // Right now this is watching the whole form changes,
    // which is inefficient.
    const eventFormValues = this.#eventFormValueChanges();

    untracked(() => {
      const additionalQuestions = this.additionalQuestions();

      this.finalAdditionalQuestions.set(
        additionalQuestions.map((additionalQuestion) => {
          if (additionalQuestion.dependsOn) {
            const { question, answer } = additionalQuestion.dependsOn;
            additionalQuestion.visible = eventFormValues[question] === answer;
          } else {
            additionalQuestion.visible = ['info', 'text', 'select'].includes(
              additionalQuestion.type,
            );
          }

          return additionalQuestion;
        }),
      );
    });
  });

  ngAfterViewInit(): void {
    this.#afterViewInit$.next();
  }

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
    eventRecord: EventRecord | null,
    questions?: AdditionalQuestion[],
  ): AdditionalQuestion[] {
    if (!questions) {
      return [];
    }

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

      formValue[key] = formValue[key] ?? '';
    }

    this.eventForm().setValue(formValue);
  }
}
