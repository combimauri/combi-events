import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'combi-event-card',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  template: `
    <mat-card appearance="raised">
      <mat-card-header>
        <mat-card-title>
          <h6>
            {{ event().name }}
          </h6>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="event-card__data">
          <p class="event-card__item event-card__item--description">
            <span>
              {{ event().shortDescription }}
            </span>
          </p>
          <p class="event-card__item">
            <mat-icon
              aria-hidden="false"
              aria-label="ícono de ubicación"
              fontIcon="location_on"
            ></mat-icon>
            <span>
              {{ event().location.name }}
            </span>
          </p>
          <p class="event-card__item">
            <mat-icon
              aria-hidden="false"
              aria-label="ícono de personas"
              fontIcon="groups"
            ></mat-icon>
            <span>
              {{ event().capacity }}
            </span>
          </p>
        </div>
        <div>
          <img mat-card-lg-image [alt]="event().name" [src]="event().image" />
        </div>
      </mat-card-content>
      <mat-card-actions>
        <a mat-button [routerLink]="event().id">Ver Más</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    mat-card-content {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      .event-card__data {
        display: flex;
        flex: 1;
        flex-direction: column;

        .event-card__item {
          align-items: center;
          display: flex;
          gap: 0.5rem;

          mat-icon {
            flex-shrink: 0;
          }

          span {
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            display: -webkit-box;
            overflow: hidden;
            word-wrap: break-word;
          }

          &.event-card__item--description span {
            -webkit-line-clamp: 4;
          }
        }
      }
    }
  `,
})
export class EventCardComponent {
  event = input.required<Event>();
}
