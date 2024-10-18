import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingState {
  readonly loading = computed(() => this.#loadRequests() > 0);

  readonly #loadRequests = signal(0);

  startLoading(): void {
    this.#loadRequests.update((loadRequests) => loadRequests + 1);
  }

  stopLoading(): void {
    if (this.#loadRequests() > 0) {
      this.#loadRequests.update((loadRequests) => loadRequests - 1);
    }
  }
}
