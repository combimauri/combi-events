import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  User,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { loadEffect, handleError } from '@core/utils';
import { Observable, from, tap, catchError, of } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #auth = inject(Auth);
  readonly #broadcastChannel = new BroadcastChannel('auth');
  readonly #googleProvider = new GoogleAuthProvider();
  readonly #loadEffectObserver = loadEffect();
  readonly #logger = inject(LoggerService);
  readonly #platformId = inject(PLATFORM_ID);
  readonly #router = inject(Router);

  readonly user$: Observable<User | null> = user(this.#auth);

  constructor() {
    this.listenBroadcastChannel();
  }

  sendSignInLinkToEmail(email: string): Observable<void | undefined> {
    if (!isPlatformBrowser(this.#platformId)) {
      return of(undefined);
    }

    let url = '';
    const currentUrl = window.location.href;
    const questionMarkIndex = currentUrl.indexOf('?');
    if (questionMarkIndex >= 0) {
      url =
        currentUrl.substring(0, questionMarkIndex) +
        '/verify-link' +
        currentUrl.substring(questionMarkIndex);
    } else {
      url = currentUrl + '/verify-link';
    }

    return from(
      sendSignInLinkToEmail(this.#auth, email, {
        url,
        handleCodeInApp: true,
      }),
    ).pipe(
      tap(this.#loadEffectObserver),
      tap(() => {
        localStorage.setItem('emailForSignIn', email);
        this.#logger.handleSuccess(
          'Se ha enviado un enlace de inicio de sesión a tu correo electrónico',
        );
      }),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  signInWithEmailLink(): Observable<UserCredential | undefined> {
    if (!isPlatformBrowser(this.#platformId)) {
      return of(undefined);
    }

    const url = window.location.href;

    if (!isSignInWithEmailLink(this.#auth, url)) {
      return of(undefined);
    }

    let email = window.localStorage.getItem('emailForSignIn');

    if (!email) {
      email = window.prompt(
        'Introduce tu correo electrónico para confirmar tu inicio de sesión',
      );
    }

    return from(signInWithEmailLink(this.#auth, email!, url)).pipe(
      tap(this.#loadEffectObserver),
      tap(() => {
        window.localStorage.removeItem('emailForSignIn');
        this.#broadcastChannel.postMessage('loggedIn');
      }),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  signInWithGoogle(): Observable<UserCredential | undefined> {
    return from(signInWithPopup(this.#auth, this.#googleProvider)).pipe(
      tap(this.#loadEffectObserver),
      tap(() => this.#broadcastChannel.postMessage('loggedIn')),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  logout(): Observable<void> {
    return from(this.#auth.signOut()).pipe(
      tap(this.#loadEffectObserver),
      tap(() => {
        this.#broadcastChannel.postMessage('loggedOut');
        this.#router.navigateByUrl('/login');
      }),
      catchError((error) => handleError(error, this.#logger)),
    );
  }

  private listenBroadcastChannel(): void {
    this.#broadcastChannel.onmessage = (event) => {
      if (!isPlatformBrowser(this.#platformId)) {
        return;
      }

      if (event.data === 'loggedIn' || event.data === 'loggedOut') {
        window.location.reload();
      }
    };
  }
}
