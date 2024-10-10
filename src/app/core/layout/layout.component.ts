import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardAvatar } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { UserState } from '../states/user.state';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'combi-layout',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardAvatar,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    RouterLink,
  ],
  template: `
    <header>
      <mat-toolbar>
        @if (currentUser(); as currentUser) {
          <a mat-button class="root-link" routerLink="/">CE</a>
          <span class="toolbar-spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <img
              mat-card-avatar
              class="avatar"
              [src]="currentUser.photoURL"
              [alt]="currentUser.displayName"
            />
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout$.next()">
              <mat-icon>logout</mat-icon>
              Cerrar Sesión
            </button>
          </mat-menu>
        }
      </mat-toolbar>
    </header>
    <main>
      <div class="container">
        <ng-content></ng-content>
      </div>
    </main>
    <footer>
      <span>&#64;combimauri</span>
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
          margin: 0;
          vertical-align: bottom;
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
        width: 75%;
      }
    }

    footer {
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      margin: 0 auto;
      padding: 1rem;
      width: 95%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  #auth = inject(AuthService);

  #userState = inject(UserState);
  currentUser = this.#userState.currentUser;

  logout$ = new Subject<void>();
  logout = toSignal(this.logout$.pipe(switchMap(() => this.#auth.logout())));
}
