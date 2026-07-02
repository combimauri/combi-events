import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services';
import { LoadingState, ThemeState } from '@core/states';
import { Subject, switchMap } from 'rxjs';

@Component({
  selector: 'combi-layout',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatToolbarModule,
    RouterLink,
  ],
  template: `
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
    <header>
      @if (loading()) {
        <mat-progress-bar
          class="loading-spinner"
          mode="indeterminate"
        ></mat-progress-bar>
      }
      <mat-toolbar>
        <a mat-button class="root-link" routerLink="/">
          <img class="logo" src="logo.webp" alt="Inicio de Combieventos" />
        </a>
        <span class="toolbar-spacer"></span>
        <button
          mat-icon-button
          type="button"
          [attr.aria-label]="
            darkMode() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
          "
          (click)="themeState.toggleDarkMode()"
        >
          <mat-icon
            aria-hidden="true"
            [fontIcon]="darkMode() ? 'light_mode' : 'dark_mode'"
          />
        </button>
        @if (user(); as user) {
          <button
            mat-button
            aria-label="Menú de usuario"
            [matMenuTriggerFor]="userMenu"
          >
            @if (user.photoURL; as photoURL) {
              <div
                class="avatar"
                [style.background-image]="'url(' + photoURL + ')'"
                [style.background-size]="'cover'"
              ></div>
            } @else {
              <mat-icon class="avatar__image" fontIcon="account_circle" />
            }
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout$.next()">
              <mat-icon fontIcon="logout" />
              Cerrar Sesión
            </button>
          </mat-menu>
        } @else {
          <button mat-button routerLink="/login">
            <mat-icon fontIcon="login" />
            Iniciar Sesión
          </button>
        }
      </mat-toolbar>
    </header>
    <main id="main-content">
      <div class="container">
        <ng-content></ng-content>
      </div>
    </main>
    <footer>
      <a href="https://linktr.ee/combimauri" target="_blank" rel="noopener">
        &#64;combimauri
      </a>
    </footer>
  `,
  styles: `
    :host {
      background: radial-gradient(
          80rem 24rem at 50% -8rem,
          var(--ce-accent-soft),
          transparent 70%
        ),
        var(--ce-bg);
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }

    .skip-link {
      background: var(--ce-surface);
      border-radius: 0 0 var(--ce-radius-sm) 0;
      color: var(--ce-text);
      left: 0;
      padding: 0.75rem 1rem;
      position: fixed;
      top: 0;
      transform: translateY(-150%);
      z-index: 20;

      &:focus-visible {
        transform: translateY(0);
      }
    }

    header {
      backdrop-filter: blur(12px);
      background-color: var(--ce-header-scrim);
      position: sticky;
      top: 0;
      width: 100%;
      z-index: 10;

      .loading-spinner {
        position: fixed;
        z-index: 1;
      }

      mat-toolbar {
        background: transparent;

        .logo {
          height: 26px;
          width: auto;
          vertical-align: bottom;
        }

        .root-link {
          color: inherit;
          font-size: 1.5rem;
          font-weight: bold;
          padding: 1rem;
        }

        .toolbar-spacer {
          flex: 1 1 auto;
        }

        .avatar {
          border-radius: 50%;
          height: 36px;
          width: 36px;
        }

        .avatar__image {
          margin: 0 auto;
          transform: scale(2);
        }
      }
    }

    main {
      flex: 1 0 auto;

      .container {
        height: 100%;
        margin: 1.5rem auto;
        max-width: 960px;
        padding: 0 1rem;
        width: 100%;

        @media (min-width: 960px) {
          padding: 0;
          width: 80%;
        }
      }
    }

    footer {
      border-top: 1px solid var(--ce-border);
      display: flex;
      font-size: 0.75rem;
      justify-content: flex-end;
      margin: 0 auto;
      padding: 0.75rem 1rem;
      width: 95%;

      a {
        color: var(--ce-text-muted);
        text-decoration: none;

        &:hover {
          color: var(--ce-text);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly #auth = inject(AuthService);

  readonly themeState = inject(ThemeState);
  readonly darkMode = this.themeState.darkMode;
  readonly loading = inject(LoadingState).loading;
  readonly logout$ = new Subject<void>();
  readonly user = toSignal(this.#auth.user$);

  readonly logout = toSignal(
    this.logout$.pipe(switchMap(() => this.#auth.logout())),
  );
}
