import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PaymentReceipts } from '@core/models';
import { LoadingState } from '@core/states';
import { ConfirmationDialogComponent } from '@shared/components';
import { Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-event-record-receipts',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @let receipts = mainReceipt();

    <div class="event-record-receipts">
      @if (receipts) {
        @for (link of receipts.links; track link; let i = $index) {
          <a mat-button target="_blank" rel="noreferrer" [href]="link">
            Ver Comprobante De Pago {{ i + 1 }}
            <mat-icon>open_in_new</mat-icon>
          </a>
        }
      }
      <button
        mat-flat-button
        (click)="openConfirmationDialog$.next()"
        [disabled]="loading()"
      >
        @if (validated()) {
          Invalidar Registro
        } @else {
          Validar Registro
        }
      </button>
    </div>
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
  readonly loading = inject(LoadingState).loading;
  readonly validated = input<boolean>();
  readonly paymentReceipts = input<PaymentReceipts[]>();
  protected readonly mainReceipt = computed(() =>
    this.paymentReceipts()?.find((receipt) => receipt.id === 'main'),
  );
  readonly toggleValidation = output<void>();
  readonly dialog = inject(MatDialog);
  readonly openConfirmationDialog$ = new Subject<void>();
  readonly afterDialogClosed = toSignal(
    this.openConfirmationDialog$.pipe(
      switchMap(() => {
        const title = this.validated()
          ? 'Invalidar Registro'
          : 'Validar Registro';
        const content = `Estás a punto de ${this.validated() ? 'invalidar' : 'validar'} este registro, ¿quieres proceder?`;

        return this.dialog
          .open(ConfirmationDialogComponent, {
            data: { title, content },
            width: '400px',
          })
          .afterClosed();
      }),
      tap((confirm) => {
        if (confirm) {
          this.toggleValidation.emit();
        }
      }),
    ),
  );
}
