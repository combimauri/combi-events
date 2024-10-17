import { inject, Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { AppUser } from '@core/models';
import { loadEffect, handleError } from '@core/utils';
import { catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class AppUserService {
  #firestore = inject(Firestore);
  #collectionName = 'users';
  #loadEffectObserver = loadEffect();
  #logger = inject(LoggerService);

  getUser(email: string): Observable<AppUser | undefined> {
    const docRef = doc(this.#firestore, this.#collectionName, email);

    return (docData(docRef) as Observable<AppUser>).pipe(
      tap(this.#loadEffectObserver),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  createUser({
    email,
    displayName,
    photoURL,
  }: User): Observable<AppUser | undefined> {
    const docRef = doc(this.#firestore, 'users', email || '');
    const appUser: AppUser = {
      email,
      displayName,
      photoURL,
    };

    return this.getUser(email || '').pipe(
      tap(this.#loadEffectObserver),
      switchMap((user) => {
        if (user) {
          return of(user);
        }

        return from(setDoc(docRef, appUser)).pipe(map(() => appUser));
      }),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
