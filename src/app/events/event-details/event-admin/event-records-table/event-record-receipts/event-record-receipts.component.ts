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
        (click)="openConfirmationDialog$.next('toggleValidation')"
        [disabled]="loading()"
      >
        @if (validated()) {
          Invalidar
        } @else {
          Validar
        }
      </button>
      <button
        mat-flat-button
        (click)="openConfirmationDialog$.next('deleteRecord')"
        [disabled]="loading()"
      >
        Eliminar Registro
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
  readonly #dialog = inject(MatDialog);

  readonly loading = inject(LoadingState).loading;
  readonly validated = input<boolean>();
  readonly paymentReceipts = input<PaymentReceipts[]>();
  readonly toggleValidation = output<void>();
  readonly deleteRecord = output<void>();

  protected readonly mainReceipt = computed(() =>
    this.paymentReceipts()?.find((receipt) => receipt.id === 'main'),
  );
  protected readonly openConfirmationDialog$ = new Subject<
    'toggleValidation' | 'deleteRecord'
  >();
  protected readonly afterDialogClosed = toSignal(
    this.openConfirmationDialog$.pipe(
      switchMap((action) => {
        let title = '';
        let content = '';

        if (action === 'toggleValidation') {
          title = this.validated() ? 'Invalidar Registro' : 'Validar Registro';
          content = `Estás a punto de ${this.validated() ? 'invalidar' : 'validar'} este registro, ¿quieres proceder?`;
        } else if (action === 'deleteRecord') {
          title = 'Eliminar Registro';
          content =
            'Estás a punto de eliminar este registro, ¿quieres proceder?';
        }

        return this.#dialog
          .open(ConfirmationDialogComponent, {
            data: { title, content, action },
            width: '400px',
          })
          .afterClosed();
      }),
      tap((confirm) => {
        if (!confirm) {
          return;
        }

        if (confirm === 'toggleValidation') {
          this.toggleValidation.emit();
        } else if (confirm === 'deleteRecord') {
          this.deleteRecord.emit();
        }
      }),
    ),
  );
}
