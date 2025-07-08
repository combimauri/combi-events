import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SimpleQR } from '@core/models';

@Component({
  selector: 'combi-event-record-receipts',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    @let receipt = mainReceipt();

    @if (receipt) {
      <div class="event-record-receipts">
        <a mat-button target="_blank" rel="noreferrer" [href]="receipt.link">
          Ver Comprobante De Pago
        </a>
        <button mat-flat-button (click)="toggleValidation.emit()">
          @if (validated()) {
            Invalidar Pago
          } @else {
            Validar Pago
          }
        </button>
      </div>
    }
  `,
  styles: `
    .event-record-receipts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRecordReceiptsComponent {
  readonly validated = input<boolean>();
  readonly paymentReceipts = input<SimpleQR[]>();
  protected readonly mainReceipt = computed(() =>
    this.paymentReceipts()?.find((receipt) => receipt.id === 'main'),
  );
  readonly toggleValidation = output<void>();
}
