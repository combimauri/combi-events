import { computed, Injectable, signal } from '@angular/core';
import { RegistrationStep } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class RegistrationStepState {
  readonly #registrationStep = signal<RegistrationStep>(RegistrationStep.form);

  readonly registrationStep = computed(() => this.#registrationStep());

  setRegistrationStep(step: RegistrationStep): void {
    this.#registrationStep.set(step);
  }
}
