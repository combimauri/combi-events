import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { RegistrationStep } from '@core/models';
import { RegistrationStepState } from '@core/states';

export const exitRegistrationGuard: CanDeactivateFn<{
  canDeactivate: () => boolean;
}> = (component) => {
  const registrationStep = inject(RegistrationStepState).registrationStep();
  let message = '¿Estás seguro de querer salir?';

  switch (registrationStep) {
    case RegistrationStep.form:
    case RegistrationStep.details:
      message = 'No completaste tu registro, ¿estás seguro de querer salir?';
      break;
    case RegistrationStep.payment:
      message =
        'Tu pago se está procesando, ¿estás seguro de querer salir? Si ya subiste tu comprobante o la pasarela indica que tu pago fue exitoso, no te preocupes, tu registro se completó correctamente.';
      break;
  }

  return component.canDeactivate() ? true : confirm(message);
};
