import { computed, Injectable, signal } from '@angular/core';
import { AppUser } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class UserState {
  currentUser = computed(() => this.#user());

  #user = signal<AppUser | undefined>(undefined);

  setUser(user: AppUser | undefined): void {
    this.#user.set(user);
  }

  cleanUser(): void {
    this.#user.set(undefined);
  }
}
