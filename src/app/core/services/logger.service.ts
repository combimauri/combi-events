import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  readonly #snackBar = inject(MatSnackBar);

  handleSuccess(message: string): void {
    this.#snackBar.open(message, 'cerrar', {
      panelClass: 'info-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  handleError(message: string | { message: string }): void {
    const messageText = this.hasMessage(message) ? message.message : message;

    this.#snackBar.open(messageText, 'cerrar', {
      panelClass: 'error-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
    console.error(message);
  }

  private hasMessage(
    message: string | { message: string },
  ): message is { message: string } {
    return (message as { message: string }).message !== undefined;
  }
}
