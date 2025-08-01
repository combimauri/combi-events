import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { EventRecord, RegisterRecordError } from '@core/models';
import { AdditionalRegistry } from '@core/models/additional-registry.model';
import { EventRecordsService, LoggerService } from '@core/services';
import { EventState } from '@core/states';
import { QuestionLabelPipe } from '@shared/pipes';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { filter, skipWhile, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-registries-scanner',
  standalone: true,
  imports: [
    KeyValuePipe,
    MatButtonModule,
    MatCardModule,
    NgTemplateOutlet,
    QuestionLabelPipe,
    ZXingScannerModule,
  ],
  template: `
    @switch (scanStatus()) {
      @case ('SCANNING') {
        <zxing-scanner (scanSuccess)="scannedId$.next($event)" />
      }
      @case ('SUCCESS') {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title class="entry-scanner__success-message">
              {{ statusMessage() }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="entry-scanner__image-container">
              <img src="success.webp" alt="imagen de éxito" />
            </div>

            @if (scanEventRecord(); as eventRecord) {
              <p>
                <b> Detalles del Registro </b>
              </p>
              <p><b>Correo Electrónico:</b> {{ eventRecord.email }}</p>
              <p><b>Nombre Completo:</b> {{ eventRecord.fullName }}</p>
              @for (
                item of eventRecord.additionalRegistries | keyvalue;
                track item.key
              ) {
                <p>
                  <b>{{ item.key | questionLabel: eventRegistries() }}:</b>
                  {{ item.value ? 'Registrado' : 'No Registrado' }}
                </p>
              }
            }
          </mat-card-content>
        </mat-card>

        <ng-template *ngTemplateOutlet="scanAgainButton" />
      }
      @case ('ERROR') {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title class="entry-scanner__error-message">
              {{ statusMessage() }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="entry-scanner__image-container">
              <img src="error.webp" alt="imagen de error" />
            </div>
          </mat-card-content>
        </mat-card>

        <ng-template *ngTemplateOutlet="scanAgainButton" />
      }
    }

    <ng-template #scanAgainButton>
      <button
        mat-fab
        extended
        type="button"
        class="entry-scanner__scan-again-button"
        (click)="scanStatus.set('SCANNING')"
      >
        Volver a Escanear
      </button>
    </ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .entry-scanner__success-message {
      color: #4caf50;
    }

    .entry-scanner__error-message {
      color: #b00020;
    }

    .entry-scanner__image-container {
      display: flex;
      justify-content: center;
      padding-top: 1rem;

      img {
        max-width: 100%;
      }
    }

    .entry-scanner__scan-again-button {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistriesScannerComponent {
  readonly #eventState = inject(EventState);
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #logger = inject(LoggerService);

  readonly additionalRegistry = input.required<AdditionalRegistry>();
  readonly eventRegistries = computed(
    () => this.#eventState.event()?.registries || [],
  );
  readonly statusMessage = signal<string>('');
  readonly scannedId$ = new Subject<string>();
  readonly scan$ = this.scannedId$.pipe(
    skipWhile(() => this.scanStatus() === 'PROCESSING'),
    filter((scannedId) => !!scannedId),
    switchMap((scannedId) => {
      this.scanStatus.set('PROCESSING');

      return this.#eventRecordsService.registerAdditionalRegistry(
        scannedId,
        this.additionalRegistry().key,
      );
    }),
    tap((response) => this.handleRegistrationResponse(response)),
  );
  readonly scanResult = toSignal(this.scan$);
  readonly scanEventRecord = computed(() =>
    this.setEventRecord(this.scanResult()),
  );
  readonly scanStatus = signal<'SCANNING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>(
    'SCANNING',
  );

  private setEventRecord(
    eventRecord: EventRecord | RegisterRecordError | undefined,
  ): EventRecord | null {
    eventRecord = eventRecord as EventRecord;

    if (eventRecord?.id) {
      return eventRecord;
    }

    return null;
  }

  private handleRegistrationResponse(
    response: EventRecord | RegisterRecordError | undefined,
  ) {
    if ((response as EventRecord).id) {
      this.scanStatus.set('SUCCESS');
      this.statusMessage.set('Ítem registrado.');
      this.#logger.handleInfo(this.statusMessage());
    } else {
      this.scanStatus.set('ERROR');

      if (response) {
        if (RegisterRecordError.NoRecord === response) {
          this.statusMessage.set('No se encontró el registro al evento.');
        } else if (RegisterRecordError.AlreadyRegistered === response) {
          this.statusMessage.set('El registro del ítem ya fue realizado.');
        }
      } else {
        this.statusMessage.set('Error registrando el ítem.');
      }

      this.#logger.handleError(this.statusMessage());
    }
  }
}
