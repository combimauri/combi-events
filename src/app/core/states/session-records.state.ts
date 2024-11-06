import { computed, Injectable, signal } from '@angular/core';
import { SessionRecord } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class SessionRecordsState {
  #userSessions = signal<SessionRecord[]>([]);

  userSessions = computed(() => this.#userSessions());

  setUserSessions(userSessions: SessionRecord[]): void {
    this.#userSessions.set(userSessions);
  }

  addUserSession(userSession: SessionRecord): void {
    this.#userSessions.set([...this.#userSessions(), userSession]);
  }

  removeUserSession(userSessionId: string): void {
    this.#userSessions.set(
      this.#userSessions().filter(
        (userSession) => userSession.id !== userSessionId,
      ),
    );
  }
}
