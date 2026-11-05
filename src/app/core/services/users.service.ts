import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { AppUser, UserRole } from '@core/models';
import { catchError, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  readonly #auth = inject(AuthService);
  readonly #collectionName = 'users';
  readonly #injector = inject(Injector);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Profile of the signed-in user (`users/{email}`), `undefined` when signed
   * out or when the document does not exist. Errors are swallowed on purpose: a
   * missing profile simply means "no roles", it is not something to surface.
   *
   * Always `undefined` during SSR: this service is used by the layout, which
   * renders on every request, and initialising the full Firestore SDK on the
   * server leaves pending work that keeps the render from ever finishing
   * (requests then time out). There is no signed-in user on the server anyway.
   */
  readonly currentUser$: Observable<AppUser | undefined> = this.#isBrowser
    ? this.#auth.user$.pipe(
        switchMap((user) =>
          user?.email ? this.getUserById(user.email) : of(undefined),
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
      )
    : of(undefined);

  readonly isAdmin$: Observable<boolean> = this.hasRole$('admin');

  hasRole$(role: UserRole): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => !!user?.roles?.includes(role)));
  }

  /** Users are keyed by their (lowercase) email address. */
  getUserById(email: string): Observable<AppUser | undefined> {
    // Resolved lazily so Firestore is never instantiated during SSR.
    const firestore = this.#injector.get(Firestore);
    const docRef = doc(firestore, this.#collectionName, email.toLowerCase());

    return (docData(docRef) as Observable<AppUser | undefined>).pipe(
      catchError(() => of(undefined)),
    );
  }
}
