import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { EventState } from '@core/states';
import { QuestionLabelPipe } from '@shared/pipes';
import { BaseScannerComponent } from '../base-scanner.component';
import { ScannerUiComponent } from '../scanner-ui/scanner-ui.component';

@Component({
  selector: 'combi-entry-scanner',
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
            item of eventRecord.additionalAnswers | keyvalue;
            track item.key
          ) {
            <p>
              <b>{{ item.key | questionLabel: additionalQuestions() }}:</b>
              {{ item.value || 'N/A' }}
            </p>
          }
        }
      </ng-template>
    </combi-scanner-ui>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryScannerComponent extends BaseScannerComponent {
  readonly #eventState = inject(EventState);

  readonly additionalQuestions = computed(
    () => this.#eventState.event()?.additionalQuestions || [],
  );

  protected successMessage = 'Entrada registrada.';
  protected noRecordErrorMessage = 'No se encontró el registro.';
  protected alreadyRegisteredErrorMessage = 'El registro ya fue realizado.';
  protected genericErrorMessage = 'Error registrando la entrada.';

  protected register(scannedId: string) {
    return this.eventRecordsService.registerRecordEntry(scannedId);
  }
}
