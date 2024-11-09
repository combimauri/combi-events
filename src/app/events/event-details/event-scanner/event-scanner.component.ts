import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Registry } from '@core/models';
import { SessionForScanState } from '@core/states';
import { PageTitleComponent } from '@shared/components';
import { RegistryLabelPipe } from '@shared/pipes';
import { EntryScannerComponent } from './entry-scanner/entry-scanner.component';
import { ProductScannerComponent } from './product-scanner/product-scanner.component';
import { SessionScannerComponent } from './session-scanner/session-scanner.component';

@Component({
  selector: 'combi-event-scanner',
  standalone: true,
  imports: [
    EntryScannerComponent,
    MatButtonModule,
    MatCardModule,
    PageTitleComponent,
    ProductScannerComponent,
    RegistryLabelPipe,
    SessionScannerComponent,
  ],
  template: `
    <div class="event-scanner">
      @if (selectedRegistry(); as registry) {
        <combi-page-title
          [selfHandle]="false"
          (goBack)="selectedRegistry.set(null)"
        >
          {{ registry | registryLabel: sessionForScan() }}
        </combi-page-title>

        @switch (registry) {
          @case (Registry.Entry) {
            <combi-entry-scanner />
          }
          @case (Registry.Product) {
            <combi-product-scanner />
          }
          @case (Registry.Session) {
            <combi-session-scanner />
          }
        }
      } @else {
        <combi-page-title> Escanear Entrada </combi-page-title>

        <mat-card>
          <mat-card-content class="event-scanner__selector">
            <button
              mat-flat-button
              class="event-scanner__registry-btn"
              (click)="selectedRegistry.set(Registry.Entry)"
            >
              Registrar Entrada
            </button>
            <!-- <button
              mat-flat-button
              class="secondary-button event-scanner__registry-btn"
              (click)="selectedRegistry.set(Registry.Product)"
            >
              Registrar Producto
            </button> -->
            <button
              mat-flat-button
              class="tertiary-button event-scanner__registry-btn"
              (click)="selectedRegistry.set(Registry.Session)"
            >
              Registrar Taller
            </button>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: `
    .event-scanner {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 0 auto;

      @media (min-width: 960px) {
        max-width: 640px;
        width: 75%;
      }

      .event-scanner__selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .event-scanner__registry-btn {
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventScannerComponent {
  readonly #sessionForScanState = inject(SessionForScanState);

  readonly Registry = Registry;

  readonly selectedRegistry = signal<Registry | null>(null);
  readonly sessionForScan = this.#sessionForScanState.sessionForScan;
}
