import { computed, Injectable, signal } from '@angular/core';
import { ProductRecord } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ProductRecordState {
  #productRecord = signal<ProductRecord | null>(null);

  productRecord = computed(() => this.#productRecord());

  setProductRecord(productRecord: ProductRecord): void {
    this.#productRecord.set(productRecord);
  }

  clearProductRecord(): void {
    this.#productRecord.set(null);
  }
}
