import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { EventRecord } from '@core/models';
import { EventRecordsService, PaymentsService } from '@core/services';
import { LoadingState, UserState } from '@core/states';
import { TitleSpinnerComponent } from '@shared/components';
import { map, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-user-event-record',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, RouterLink, TitleSpinnerComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <h6>Registro</h6>
        </mat-card-title>
        @if (validationLoadingState.loading()) {
          <combi-title-spinner />
        }
      </mat-card-header>
      <mat-card-content>
        @if (eventRecord().validated || validatedRecordResult()) {
          <mat-card class="user-event-record" appearance="outlined">
            <mat-card-header>
              @let user = currentUser();

              @if (user) {
                <div
                  mat-card-avatar
                  class="user-event-record__avatar"
                  [style.background-image]="'url(' + user.photoURL + ')'"
                  [style.background-size]="'cover'"
                ></div>
              }
              <mat-card-title> ¡Ya eres parte! </mat-card-title>
              <mat-card-subtitle>
                Nos vemos en el evento
                {{ user?.displayName || '' }}
              </mat-card-subtitle>
            </mat-card-header>
          </mat-card>
        } @else {
          <p>
            @if (validationLoadingState.loading()) {
              Encontramos tu registro, pero el pago aún no fue validado. Espera
              unos segundos mientras lo verificamos.
            } @else if (!validatedRecordResult()) {
              No pudimos validar tu pago. Por favor, completa el mismo haciendo
              click aquí: <a mat-button routerLink="register">Completar Pago</a>
              <br />
              Si consideras que es un error, por favor, contacta a soporte:
              <a
                mat-button
                href="https://wa.me/59177996059"
                target="_blank"
                rel="noopener noreferrer"
              >
                Soporte
              </a>
            }
          </p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .user-event-record {
      background-color: #388e3c;
      padding-bottom: 1rem;

      mat-card-header {
        align-items: center;
      }

      mat-card-title,
      mat-card-subtitle {
        color: #fff;
      }

      .user-event-record__avatar {
        margin: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEventRecordComponent {
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #paymentsService = inject(PaymentsService);

  readonly validationLoadingState = new LoadingState();
  readonly eventRecord = input.required<EventRecord>();
  readonly currentUser = inject(UserState).currentUser;

  readonly validatePayment$ = new Subject<EventRecord>();
  readonly validatedRecordResult = toSignal(
    this.validatePayment$.pipe(
      tap(() => this.validationLoadingState.startLoading()),
      switchMap(({ id, orderId }) =>
        this.#paymentsService.validatePayment(orderId).pipe(map(() => id)),
      ),
      switchMap((recordId) =>
        this.#eventRecordsService.getRecordById(recordId),
      ),
      map((record) => {
        this.validationLoadingState.stopLoading();

        return record?.validated;
      }),
    ),
  );

  constructor() {
    effect(() => this.triggerPaymentValidation(this.eventRecord()));
  }

  private triggerPaymentValidation(eventRecord: EventRecord): void {
    if (!eventRecord || eventRecord?.validated) {
      return;
    }

    queueMicrotask(() => this.validatePayment$.next(eventRecord));
  }
}
