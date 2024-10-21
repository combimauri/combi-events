import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '@angular/fire/auth';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import {
  AdditionalQuestion,
  BillingRecord,
  RegistrationStep,
  EventRecord,
} from '@core/models';
import { AuthService } from '@core/services';
import {
  LoadingState,
  RegistrationStepState,
  EventRecordState,
} from '@core/states';
import { BackButtonComponent } from '@shared/components';

@Component({
  selector: 'combi-event-registration-form',
  standalone: true,
  imports: [
    BackButtonComponent,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    RouterLink,
  ],
  template: `
    <form #eventForm="ngForm" (ngSubmit)="register()">
      <mat-card appearance="outlined">
        <mat-card-content class="page-title">
          <combi-back-button />
          <h4>Registrarse al Evento</h4>
        </mat-card-content>
      </mat-card>

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

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <p>Número de Teléfono</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Tu respuesta</mat-label>
            <input
              matInput
              required
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              [disabled]="loading()"
              [ngModel]="phoneNumber()"
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
        Registrarse y Pagar
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
export class EventRegistrationFormComponent implements OnInit {
  readonly #eventRecord = inject(EventRecordState).eventRecord;
  readonly #registrationStepState = inject(RegistrationStepState);
  readonly #user = toSignal(inject(AuthService).user$, { initialValue: null });

  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly eventForm = viewChild.required(NgForm);
  readonly loading = inject(LoadingState).loading;
  readonly submitForm = output<BillingRecord>();

  fullName = computed(() =>
    this.mapFullName(this.#eventRecord(), this.#user()),
  );
  phoneNumber = computed(() =>
    this.mapPhoneNumber(this.#eventRecord(), this.#user()),
  );
  answeredQuestions = computed(() =>
    this.mapQuestions(this.additionalQuestions(), this.#eventRecord()),
  );

  ngOnInit(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  register(): void {
    this.trimValues();

    if (this.eventForm().invalid) {
      return;
    }

    const formValue = this.eventForm().value;
    const email = this.#user()?.email!;
    const { fullName, phoneNumber } = formValue;

    delete formValue.fullName;
    delete formValue.phoneNumber;

    const billingRecord: BillingRecord = {
      email,
      fullName,
      phoneNumber,
      additionalAnswers: { ...formValue },
    };

    this.submitForm.emit(billingRecord);
  }

  private mapFullName(
    eventRecord: EventRecord | null,
    user: User | null,
  ): string {
    return eventRecord?.fullName || user?.displayName || '';
  }

  private mapPhoneNumber(
    eventRecord: EventRecord | null,
    user: User | null,
  ): string {
    return eventRecord?.phoneNumber || user?.phoneNumber || '';
  }

  private mapQuestions(
    questions: AdditionalQuestion[],
    eventRecord: EventRecord | null,
  ): AdditionalQuestion[] {
    if (!eventRecord) {
      return questions;
    }

    for (const question of questions) {
      question.answer = eventRecord.additionalAnswers[question.key] ?? '';
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
