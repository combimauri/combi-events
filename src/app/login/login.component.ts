import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, tap } from 'rxjs';
import { AppUser } from '../core/models/app-user.model';
import { AuthService } from '../core/services/auth.service';
import { LoadingState } from '../core/states/loading.state';

@Component({
  selector: 'combi-login',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h6>Bienvenido a Combieventos</h6>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Inicia sesión para ver nuestros eventos</p>
          <hr />
        </mat-card-content>
        <mat-card-actions>
          <button
            mat-fab
            extended
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
      margin-top: 2rem;
    }

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

  readonly loading = inject(LoadingState).loading;

  readonly signInWithGoogle$ = new Subject<void>();
  readonly googleAuth = toSignal(
    this.signInWithGoogle$.pipe(
      switchMap(() => this.#auth.signInWithGoogle()),
      tap({ next: (response) => this.handleSignInResponse(response) }),
    ),
  );

  private handleSignInResponse(response: AppUser | undefined): void {
    if (!response) {
      return;
    }

    this.#router.navigateByUrl(this.#returnUrl);
  }
}
