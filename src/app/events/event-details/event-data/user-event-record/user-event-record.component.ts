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
import { map, Subject, switchMap } from 'rxjs';
import { EventRecord } from '../../../../core/models/event-record.model';
import { EventRecordsService } from '../../../../core/services/event-records.service';
import { PaymentsService } from '../../../../core/services/payments.service';
import { UserState } from '../../../../core/states/user.state';
import { LoadingState } from '../../../../core/states/loading.state';

@Component({
  selector: 'combi-user-event-record',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, RouterLink],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <h6>Registro</h6>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (eventRecord().validated || validatedRecordResult()) {
          <mat-card appearance="outlined">
            <mat-card-header>
              @let user = currentUser();

              @if (user) {
                <div
                  mat-card-avatar
                  [style.background-image]="'url(' + user.photoURL + ')'"
                  [style.background-size]="'cover'"
                ></div>
              }
              <mat-card-title> ¡Ya eres parte! </mat-card-title>
              <mat-card-subtitle>
                Nos vemos en el evento
                {{ user?.displayName }}
              </mat-card-subtitle>
            </mat-card-header>
          </mat-card>
        } @else {
          <p>
            @if (loading()) {
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
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEventRecordComponent {
  readonly loading = inject(LoadingState).loading;

  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #paymentsService = inject(PaymentsService);

  readonly eventRecord = input.required<EventRecord>();
  readonly currentUser = inject(UserState).currentUser;

  readonly validatePayment$ = new Subject<EventRecord>();
  readonly validatedRecordResult = toSignal(
    this.validatePayment$.pipe(
      switchMap(({ id, orderId }) =>
        this.#paymentsService.validatePayment(orderId).pipe(map(() => id)),
      ),
      switchMap((recordId) =>
        this.#eventRecordsService.getRecordById(recordId),
      ),
      map((record) => record?.validated),
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
