import { CanDeactivateFn } from '@angular/router';

export const exitRegistrationGuard: CanDeactivateFn<{
  canDeactivate: () => boolean;
}> = (component) => {
  return component.canDeactivate()
    ? true
    : confirm(
        'Parece que no completaste el proceso de inscripción. ¿Estás seguro de que quieres salir?',
      );
};
