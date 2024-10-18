import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services';
import { UserState, LoadingState } from '@core/states';
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
    <header>
      <mat-toolbar>
        @if (currentUser(); as currentUser) {
          <a mat-button class="root-link" routerLink="/">
            <img class="logo" src="logo.webp" alt="logo de combieventos" />
          </a>
          <span class="toolbar-spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu">
            @if (currentUser.photoURL) {
              <div
                class="avatar"
                [style.background-image]="'url(' + currentUser.photoURL + ')'"
                [style.background-size]="'cover'"
              ></div>
            } @else {
              <mat-icon class="avatar__image">account_circle</mat-icon>
            }
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout$.next()">
              <mat-icon>logout</mat-icon>
              Cerrar Sesión
            </button>
          </mat-menu>
        }
      </mat-toolbar>
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
    </header>
    <main>
      <div class="container">
        <ng-content></ng-content>
      </div>
    </main>
    <footer>
      <a
        href="https://linktr.ee/combimauri"
        target="_blank"
      >
        &#64;combimauri
      </a>
    </footer>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100dvh;
    }

    header {
      position: fixed;
      width: 100%;
      z-index: 1;

      mat-toolbar {
        background-color: #d7e3ff;
        color: #005cbb;

        .logo {
          height: auto;
          width: 50px;
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
      margin-top: 64px;

      .container {
        height: 100%;
        margin: 1rem auto;
        max-width: 1080px;
        padding: 0 1rem;
        width: 100%;

        @media (min-width: 960px) {
          padding: 0;
          width: 75%;
        }
      }
    }

    footer {
      border-top: 1px solid #e0e0e0;
      display: flex;
      font-size: 0.75rem;
      justify-content: flex-end;
      margin: 0 auto;
      padding: 0.5rem;
      width: 95%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly #auth = inject(AuthService);

  readonly loading = inject(LoadingState).loading;
  readonly currentUser = inject(UserState).currentUser;
  readonly logout$ = new Subject<void>();
  readonly logout = toSignal(
    this.logout$.pipe(switchMap(() => this.#auth.logout())),
  );
}
