import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Session } from '@core/models';
import { LoadingState } from '@core/states';

@Component({
  selector: 'combi-session-card',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <div
          mat-card-avatar
          class="session-card__avatar"
          [style.background]="'url(' + session().speaker.photoUrl + '&sz=h40)'"
        ></div>
        <mat-card-title>
          {{ session().name }}
        </mat-card-title>
        <mat-card-subtitle>
          {{ session().speaker.name }}
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>{{ session().description }}</p>
        <p><b>Requerimientos:</b> {{ session().requirements }}</p>
        <p class="session-card__item">
          <mat-icon
            aria-hidden="false"
            aria-label="ícono de personas"
            fontIcon="groups"
          />
          <span> {{ session().count }} / {{ session().limit }} </span>
        </p>
      </mat-card-content>
      <mat-card-actions>
        @if (session().isRegistered) {
          <button
            mat-flat-button
            class="tertiary-button"
            [disabled]="loading()"
            (click)="unregister.emit(session().id)"
          >
            Liberar Registro
          </button>
        } @else {
          <button
            mat-flat-button
            [disabled]="loading()"
            (click)="register.emit(session().id)"
          >
            Registrarse
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    :host {
      flex-grow: 1;
    }

    .session-card__avatar {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .session-card__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionCardComponent {
  readonly session = input.required<Session>();

  readonly register = output<string>();
  readonly unregister = output<string>();

  readonly loading = inject(LoadingState).loading;
}
