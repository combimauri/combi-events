import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AppUser } from '@core/models';
import { AuthService } from '@core/services';
import { LoadingState } from '@core/states';
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
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <h6>Bienvenido a Combieventos</h6>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Por favor, inicia sesión o regístrate para ver nuestros eventos</p>
        <form #loginForm="ngForm" (ngSubmit)="sendSignInLink()">
          <mat-form-field appearance="outline" class="login-field">
            <mat-label>Correo Electrónico</mat-label>
            <input
              matInput
              required
              type="email"
              id="email"
              name="email"
              [disabled]="loading()"
              [(ngModel)]="email"
            />
          </mat-form-field>
          <button
            mat-flat-button
            class="login__button"
            type="submit"
            [disabled]="loading() || loginForm.invalid"
          >
            Continuar con Correo Electrónico
          </button>
        </form>
        <hr />
      </mat-card-content>
      <mat-card-actions>
        <button
          mat-raised-button
          class="login__button"
          [disabled]="loading()"
          (click)="signInWithGoogle$.next()"
        >
          <mat-icon>login</mat-icon>
          Iniciar Sesión con Google
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    :host {
      align-items: center;
      display: flex;
      height: 100%;
    }

    mat-card {
      display: flex;
      height: fit-content;
      max-width: 400px;
      margin: 80px auto 140px;
      padding: 1rem;
    }

    mat-card-actions {
      padding-top: 1rem;
    }

    hr {
      margin-top: 1rem;
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

  private handleSignInResponse(response: AppUser | undefined): void {
    if (!response) {
      return;
    }

    this.#router.navigateByUrl(this.#returnUrl);
  }
}
