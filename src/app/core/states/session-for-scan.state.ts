import { computed, Injectable, signal } from '@angular/core';
import { Session } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class SessionForScanState {
  readonly #sessionForScan = signal<Session | null>(null);

  readonly sessionForScan = computed(() => this.#sessionForScan());

  setSessionForScan(session: Session) {
    this.#sessionForScan.set(session);
  }

  clearSessionForScan() {
    this.#sessionForScan.set(null);
  }
}
