import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
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
import {
  LoadingState,
  RegistrationStepState,
  UserState,
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
          <h4>Inscripción al Evento</h4>
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
              [(ngModel)]="fullName"
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
              [(ngModel)]="phoneNumber"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      @for (question of additionalQuestions(); track question.key) {
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
                    [(ngModel)]="question.answer"
                  />
                }
                @case ('select') {
                  <mat-select
                    [id]="question.key"
                    [name]="question.key"
                    [disabled]="loading()"
                    [required]="question.required"
                    [(ngModel)]="question.answer"
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
  readonly #registrationStepState = inject(RegistrationStepState);
  readonly #userState = inject(UserState);
  readonly #eventRecordState = inject(EventRecordState);

  fullName = '';
  phoneNumber = '';

  readonly additionalQuestions = input<AdditionalQuestion[]>([]);
  readonly eventForm = viewChild.required(NgForm);
  readonly submitForm = output<BillingRecord>();
  readonly loading = inject(LoadingState).loading;

  constructor() {
    effect(
      () => (this.fullName = this.#userState.currentUser()?.displayName || ''),
    );
    effect(() => this.patchForm(this.#eventRecordState.eventRecord()));
  }

  ngOnInit(): void {
    this.#registrationStepState.setRegistrationStep(RegistrationStep.form);
  }

  register(): void {
    this.trimValues();

    if (this.eventForm().invalid) {
      return;
    }

    const formValue = this.eventForm().value;
    const email = this.#userState.currentUser()?.email!;
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

  private patchForm(eventRecord: EventRecord | null): void {
    if (!eventRecord) {
      return;
    }

    this.fullName = eventRecord.fullName;
    this.phoneNumber = eventRecord.phoneNumber;
    const additionalQuestions = this.additionalQuestions();

    for (const question of additionalQuestions) {
      question.answer = eventRecord.additionalAnswers[question.key] ?? '';
    }
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
