import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { EventRecord } from '@core/models';
import { AdditionalRegistry } from '@core/models/additional-registry.model';
import { EventState } from '@core/states';
import { QuestionLabelPipe } from '@shared/pipes';
import { BaseScannerComponent } from '../base-scanner.component';
import { ScannerUiComponent } from '../scanner-ui/scanner-ui.component';

@Component({
  selector: 'combi-registries-scanner',
  standalone: true,
  imports: [KeyValuePipe, QuestionLabelPipe, ScannerUiComponent],
  template: `
    <combi-scanner-ui
      [scanStatus]="scanStatus()"
      [statusMessage]="statusMessage()"
      (scanSuccess)="scannedId$.next($event)"
      (scanAgain)="scanStatus.set('SCANNING')"
    >
      <ng-template #successDetails>
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
      </ng-template>
    </combi-scanner-ui>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistriesScannerComponent extends BaseScannerComponent {
  readonly #eventState = inject(EventState);

  readonly additionalRegistry = input.required<AdditionalRegistry>();
  readonly eventRegistries = computed(
    () => this.#eventState.event()?.registries || [],
  );

  protected successMessage = 'Ítem registrado.';
  protected noRecordErrorMessage = 'No se encontró el registro al evento.';
  protected alreadyRegisteredErrorMessage =
    'El registro del ítem ya fue realizado.';
  protected genericErrorMessage = 'Error registrando el ítem.';

  protected register(scannedId: string) {
    return this.eventRecordsService.registerAdditionalRegistry(
      scannedId,
      this.additionalRegistry().key,
    );
  }
}
