import { computed, Injectable, signal } from '@angular/core';
import { RegistrationStep } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class RegistrationStepState {
  #registrationStep = signal<RegistrationStep>(RegistrationStep.form);

  registrationStep = computed(() => this.#registrationStep());

  setRegistrationStep(step: RegistrationStep) {
    this.#registrationStep.set(step);
  }
}
