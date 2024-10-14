import { computed, Injectable, signal } from '@angular/core';
import { RegistrationStep } from '../models/registration-step.enum';

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
