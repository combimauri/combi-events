import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { ProductsService } from '@core/services';
import { EventState } from '@core/states';
import { PageTitleComponent, ProductCardComponent } from '@shared/components';
import { Subject, switchMap } from 'rxjs';

@Component({
  selector: 'combi-event-marketplace',
  standalone: true,
  imports: [MatCardModule, PageTitleComponent, ProductCardComponent],
  template: `
    @if (event(); as event) {
      <combi-page-title> Productos de {{ event.name }} </combi-page-title>

      <mat-card appearance="outlined">
        <mat-card-content class="event-marketplace__products">
          @for (product of products(); track product.id) {
            <combi-product-card [eventId]="event.id" [product]="product" />
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-marketplace__products {
      display: flex;
      flex-wrap: wrap;

      combi-product-card {
        padding: 0.5rem;
        width: 100%;

        @media (min-width: 600px) {
          width: 50%;
        }

        @media (min-width: 960px) {
          width: 33.33%;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventMarketplaceComponent {
  readonly #eventId = computed(() => this.event()!.id);
  readonly #getProducts = new Subject<string>();
  readonly #productsService = inject(ProductsService);

  readonly event = inject(EventState).event;
  readonly products = toSignal(
    this.#getProducts.pipe(
      switchMap((eventId) =>
        this.#productsService.getProductsByEventId(eventId),
      ),
    ),
    { initialValue: [] },
  );

  constructor() {
    effect(() => this.loadProducts(this.#eventId()));
  }

  private loadProducts(eventId: string): void {
    if (!eventId) {
      return;
    }

    queueMicrotask(() => this.#getProducts.next(eventId));
  }
}
