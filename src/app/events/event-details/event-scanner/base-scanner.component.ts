import { computed, Directive, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventRecord, RegisterRecordError } from '@core/models';
import { EventRecordsService, LoggerService } from '@core/services';
import { filter, Observable, skipWhile, Subject, switchMap, tap } from 'rxjs';

export type ScanStatus = 'SCANNING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

@Directive()
export abstract class BaseScannerComponent {
  protected readonly eventRecordsService = inject(EventRecordsService);
  private readonly logger = inject(LoggerService);

  readonly statusMessage = signal<string>('');
  readonly scannedId$ = new Subject<string>();
  readonly scanStatus = signal<ScanStatus>('SCANNING');

  readonly scan$ = this.scannedId$.pipe(
    skipWhile(() => this.scanStatus() === 'PROCESSING'),
    filter((scannedId) => !!scannedId),
    switchMap((scannedId) => {
      this.scanStatus.set('PROCESSING');
      return this.register(scannedId);
    }),
    tap((response) => this.handleRegistrationResponse(response)),
  );

  readonly scanResult = toSignal(this.scan$);
  readonly scanEventRecord = computed(() =>
    this.setEventRecord(this.scanResult()),
  );

  protected abstract successMessage: string;
  protected abstract noRecordErrorMessage: string;
  protected abstract alreadyRegisteredErrorMessage: string;
  protected abstract genericErrorMessage: string;

  protected abstract register(
    scannedId: string,
  ): Observable<EventRecord | RegisterRecordError | undefined>;

  private setEventRecord(
    eventRecord: EventRecord | RegisterRecordError | undefined,
  ): EventRecord | null {
    if (eventRecord && (eventRecord as EventRecord).id) {
      return eventRecord as EventRecord;
    }
    return null;
  }

  private handleRegistrationResponse(
    response: EventRecord | RegisterRecordError | undefined,
  ): void {
    if (response && (response as EventRecord).id) {
      this.scanStatus.set('SUCCESS');
      this.statusMessage.set(this.successMessage);
      this.logger.handleInfo(this.statusMessage());
    } else {
      this.scanStatus.set('ERROR');

      if (response) {
        switch (response) {
          case RegisterRecordError.NoRecord:
            this.statusMessage.set(this.noRecordErrorMessage);
            break;
          case RegisterRecordError.NotValidated:
            this.statusMessage.set(
              'El pago de este registro no fue validado.',
            );
            break;
          case RegisterRecordError.AlreadyRegistered:
            this.statusMessage.set(this.alreadyRegisteredErrorMessage);
            break;
          default:
            this.statusMessage.set(this.genericErrorMessage);
            break;
        }
      } else {
        this.statusMessage.set(this.genericErrorMessage);
      }

      this.logger.handleError(this.statusMessage());
    }
  }
}
