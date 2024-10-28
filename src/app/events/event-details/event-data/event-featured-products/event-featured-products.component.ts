import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { AppEvent } from '@core/models';
import { ProductsService } from '@core/services';
import { ProductCardComponent } from '@shared/components';
import { Subject, switchMap } from 'rxjs';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';

@Component({
  selector: 'combi-featured-products',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, ProductCardComponent, RouterLink],
  template: `
    @if (event(); as event) {
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <h4>Productos Destacados</h4>
          </mat-card-title>
          <a mat-button routerLink="marketplace">Ver Todos los Productos</a>
        </mat-card-header>
        <mat-card-content>
          <div class="swiper">
            <div class="swiper-wrapper">
              @for (product of products(); track product.id) {
                <div class="swiper-slide">
                  <combi-product-card
                    [eventId]="event.id"
                    [product]="product"
                  />
                </div>
              }
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    mat-card-header {
      flex-wrap: wrap;
      justify-content: space-between;

      a {
        margin-bottom: 0.5rem;
      }
    }

    .swiper-pagination {
      bottom: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventFeaturedProductsComponent {
  readonly #eventId = computed(() => this.event().id);
  readonly #getProducts = new Subject<string>();
  readonly #platformId = inject(PLATFORM_ID);
  readonly #productsService = inject(ProductsService);

  readonly event = input.required<AppEvent>();
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

  ngAfterViewInit(): void {
    this.initSwiper();
  }

  private loadProducts(eventId: string): void {
    if (!eventId) {
      return;
    }

    queueMicrotask(() => this.#getProducts.next(eventId));
  }

  private initSwiper(): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    new Swiper('.swiper', {
      autoHeight: true,
      slidesPerView: 'auto',
      spaceBetween: 20,
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        1200: {
          slidesPerView: 3,
        },
      },
      autoplay: {
        delay: 200000,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      modules: [Autoplay, Pagination],
    });
  }
}
