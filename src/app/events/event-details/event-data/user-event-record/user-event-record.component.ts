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
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { EventRecord } from '@core/models';
import {
  AuthService,
  EventRecordsService,
  PaymentsService,
} from '@core/services';
import { EventState, LoadingState } from '@core/states';
import { CredentialComponent, TitleSpinnerComponent } from '@shared/components';
import { map, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-user-event-record',
  standalone: true,
  imports: [
    CredentialComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    TitleSpinnerComponent,
  ],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header class="user-event-record__header">
        <mat-card-title>
          <h4>Registro</h4>
        </mat-card-title>
        @if (validationLoadingState.loading()) {
          <combi-title-spinner />
        } @else if (
          (eventRecord().validated || validatedRecordResult()) &&
          event()?.hasSessions
        ) {
          <a mat-button class="tertiary-button" routerLink="sessions">
            Registro a Talleres
          </a>
        }
      </mat-card-header>
      <mat-card-content>
        @if (eventRecord().validated || validatedRecordResult()) {
          <mat-card class="user-event-record" appearance="outlined">
            <mat-card-header>
              @let currentUser = user();

              @if (currentUser && currentUser.photoURL) {
                <div
                  mat-card-avatar
                  class="user-event-record__avatar"
                  [style.background-image]="'url(' + currentUser.photoURL + ')'"
                  [style.background-size]="'cover'"
                ></div>
              }
              <mat-card-title> ¡Ya eres parte! </mat-card-title>
              <mat-card-subtitle>
                Nos vemos en el evento
                {{ currentUser?.displayName || '' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <combi-credential #credential [recordCode]="eventRecord().id" />
            </mat-card-content>
            <mat-card-actions>
              <button
                mat-button
                class="tertiary-button"
                (click)="credential.download()"
              >
                Descargar Credencial
              </button>
            </mat-card-actions>
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
              <a mat-button href="https://wa.me/59177996059" target="_blank">
                Soporte
              </a>
            }
          </p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .user-event-record__header {
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .user-event-record {
      background-color: #f0f0f0;
      border-left: 4px solid #4caf50;
      color: #4caf50;

      mat-card-header {
        align-items: center;
      }

      .user-event-record__avatar {
        margin: 0;
      }

      mat-card-content {
        display: flex;
        justify-content: center;
        padding-top: 2rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEventRecordComponent {
  readonly #authService = inject(AuthService);
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #eventState = inject(EventState);
  readonly #paymentsService = inject(PaymentsService);

  readonly event = this.#eventState.event;
  readonly eventRecord = input.required<EventRecord>();
  readonly user = toSignal(this.#authService.user$);
  readonly validatePayment$ = new Subject<EventRecord>();
  readonly validationLoadingState = new LoadingState();

  readonly validatedRecordResult = toSignal(
    this.validatePayment$.pipe(
      tap(() => this.validationLoadingState.startLoading()),
      switchMap(({ id, orderId }) =>
        this.#paymentsService.validateEventPayment(orderId).pipe(map(() => id)),
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
