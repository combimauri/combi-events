import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserCredential } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { LoadingState } from '@core/states';
import { isAppBuiltInBrowser } from '@core/utils';
import { Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-login',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>
          <img src="logo.webp" alt="" width="88" />
          <h1 class="login__title">Bienvenido a Combieventos</h1>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p class="login__subtitle">
          Inicia sesión o regístrate para ver nuestros eventos
        </p>
        <form #loginForm="ngForm" (ngSubmit)="sendSignInLink()">
          <mat-form-field appearance="outline" class="login-field">
            <mat-label>Correo Electrónico</mat-label>
            <input
              matInput
              required
              type="email"
              autocomplete="email"
              id="email"
              name="email"
              [disabled]="loading()"
              [(ngModel)]="email"
            />
          </mat-form-field>
          <button
            mat-raised-button
            class="login__button"
            type="submit"
            [disabled]="loading() || loginForm.invalid"
          >
            Continuar con Correo Electrónico
          </button>
        </form>
        @if (!isAppBuiltInBrowser) {
          <hr />
        }
      </mat-card-content>
      @if (!isAppBuiltInBrowser) {
        <mat-card-actions>
          <button
            mat-flat-button
            class="login__button"
            [disabled]="loading()"
            (click)="signInWithGoogle$.next()"
          >
            <mat-icon fontIcon="login" />
            Iniciar Sesión con Google
          </button>
        </mat-card-actions>
      }
      <span>project-475094595977</span>
    </mat-card>
  `,
  styles: `
    mat-card {
      display: flex;
      height: fit-content;
      max-width: 400px;
      margin: 10vh auto 0;
      padding: 1rem;

      mat-card-title {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      span {
        color: var(--ce-text-muted);
        font-size: 0.65rem;
        font-weight: 300;
        margin-top: 1rem;
        text-align: center;
      }
    }

    .login__title {
      font-size: 1.375rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 0;
    }

    .login__subtitle {
      color: var(--ce-text-secondary);
    }

    mat-card-actions {
      padding-top: 1rem;
    }

    hr {
      border: none;
      border-top: 1px solid var(--ce-border);
      margin-top: 1rem;
      width: 100%;
    }

    .login-field,
    .login__button {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  readonly #auth = inject(AuthService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #returnUrl = this.#route.snapshot.queryParams['returnUrl'] || '/';
  readonly #sendSignInLink$ = new Subject<string>();

  email = '';

  readonly isAppBuiltInBrowser = isAppBuiltInBrowser();
  readonly loading = inject(LoadingState).loading;
  readonly signInWithGoogle$ = new Subject<void>();
  readonly googleAuth = toSignal(
    this.signInWithGoogle$.pipe(
      switchMap(() => this.#auth.signInWithGoogle()),
      tap({ next: (response) => this.handleSignInResponse(response) }),
    ),
  );
  readonly linkAuth = toSignal(
    this.#sendSignInLink$.pipe(
      switchMap((email) => this.#auth.sendSignInLinkToEmail(email)),
    ),
  );

  sendSignInLink(): void {
    this.email = this.email.trim();

    if (!this.email) {
      return;
    }

    this.#sendSignInLink$.next(this.email);
  }

  private handleSignInResponse(response: UserCredential | undefined): void {
    if (!response) {
      return;
    }

    this.#router.navigateByUrl(this.#returnUrl);
  }
}
