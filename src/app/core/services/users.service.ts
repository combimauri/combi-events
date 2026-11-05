import { inject, Injectable } from '@angular/core';
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
  readonly #firestore = inject(Firestore);

  /**
   * Profile of the signed-in user (`users/{uid}`), `undefined` when signed out
   * or when the document does not exist. Errors are swallowed on purpose: a
   * missing profile simply means "no roles", it is not something to surface.
   */
  readonly currentUser$: Observable<AppUser | undefined> =
    this.#auth.user$.pipe(
      switchMap((user) => (user ? this.getUserById(user.uid) : of(undefined))),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  readonly isAdmin$: Observable<boolean> = this.hasRole$('admin');

  hasRole$(role: UserRole): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => !!user?.roles?.includes(role)));
  }

  getUserById(uid: string): Observable<AppUser | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, uid);

    return (docData(docRef) as Observable<AppUser | undefined>).pipe(
      catchError(() => of(undefined)),
    );
  }
}
