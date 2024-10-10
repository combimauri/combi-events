import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'combi-layout',
  standalone: true,
  imports: [MatButtonModule, MatToolbarModule, RouterLink],
  template: `
    <header>
      <mat-toolbar>
        <a mat-button class="root-link" routerLink="/">CE</a>
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
      }
    }

    main {
      flex: 1 0 auto;
      margin-top: 64px;

      .container {
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
})
export class LayoutComponent {}
