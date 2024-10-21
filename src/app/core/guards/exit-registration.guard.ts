import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { RegistrationStep } from '@core/models';
import { RegistrationStepState } from '@core/states';

export const exitRegistrationGuard: CanDeactivateFn<{
  canDeactivate: () => boolean;
}> = (component) => {
  const registrationStep = inject(RegistrationStepState).registrationStep();
  const message =
    registrationStep === RegistrationStep.form
      ? 'No completaste tu registro, ¿estás seguro de querer salir?'
      : 'Tu pago se está procesando, ¿estás seguro de querer salir? Si Wolipay indica que tu pago fue exitoso, no te preocupes, tu inscripción se completó correctamente.';

  return component.canDeactivate() ? true : confirm(message);
};
