import { computed, Injectable, signal } from '@angular/core';
import { Product } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ProductState {
  readonly #product = signal<Product | null>(null);

  readonly product = computed(() => this.#product());

  setProduct(product: Product): void {
    this.#product.set(product);
  }

  clearProduct(): void {
    this.#product.set(null);
  }
}
