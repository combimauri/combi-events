import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AppUser } from '@core/models';
import { UserState } from '@core/states';
import { loadEffect, handleError } from '@core/utils';
import { Observable, from, tap, switchMap, catchError, of, map } from 'rxjs';
import { AppUserService } from './app-user.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #auth = inject(Auth);
  #googleProvider = new GoogleAuthProvider();
  #userService = inject(AppUserService);
  #userState = inject(UserState);
  #loadEffectObserver = loadEffect();
  #logger = inject(LoggerService);
  #router = inject(Router);

  loggedIn$ = user(this.#auth).pipe(
    switchMap((user: User) => {
      return this.getCurrentUser(user);
    }),
    map((user) => !!user),
  );

  signInWithGoogle(): Observable<AppUser | undefined> {
    return from(signInWithPopup(this.#auth, this.#googleProvider)).pipe(
      tap(this.#loadEffectObserver),
      switchMap(({ user }) => this.#userService.createUser(user)),
      tap((user) => this.#userState.setUser(user)),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  logout(): Observable<void> {
    return from(this.#auth.signOut()).pipe(
      tap(this.#loadEffectObserver),
      tap(() => this.#userState.cleanUser()),
      tap(() => this.#router.navigateByUrl('/login')),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  private getCurrentUser(user: User | null): Observable<AppUser | undefined> {
    if (!user) {
      return of(undefined);
    }

    if (this.#userState.currentUser()) {
      return of(this.#userState.currentUser());
    }

    return this.#userService.getUser(user.email || '').pipe(
      tap(this.#loadEffectObserver),
      tap((user) => this.#userState.setUser(user)),
      catchError((error) => handleError(error, this.#logger)),
    );
  }
}
