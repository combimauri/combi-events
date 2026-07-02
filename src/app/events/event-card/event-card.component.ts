import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppEvent } from '@core/models';

@Component({
  selector: 'combi-event-card',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRippleModule,
    NgStyle,
    RouterLink,
  ],
  template: `
    <a matRipple [routerLink]="event().id">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <h4>
              {{ event().name }}
            </h4>
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
              <mat-icon aria-hidden="true" fontIcon="location_on" />
              <span class="cdk-visually-hidden">Ubicación:</span>
              <span>
                {{ event().location.name }}
              </span>
            </p>
            <p class="event-card__item">
              <mat-icon aria-hidden="true" fontIcon="groups" />
              <span class="cdk-visually-hidden">Capacidad:</span>
              <span>
                {{ event().capacity }}
              </span>
            </p>
          </div>
          <div>
            <img
              mat-card-lg-image
              class="event-card__image"
              [alt]="event().name"
              [src]="event().image"
              [ngStyle]="{
                filter: event().openRegistration ? 'none' : 'grayscale(100%)',
              }"
              [hidden]="!imageLoaded()"
              (load)="imageLoaded.set(true)"
            />
            @if (!imageLoaded()) {
              <div class="event-card__image-skeleton"></div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </a>
  `,
  styles: `
    a {
      border-radius: var(--ce-radius-lg);
      color: inherit;
      display: block;
      text-decoration: none;

      mat-card {
        transition:
          box-shadow 0.2s ease-out,
          transform 0.2s ease-out;

        &:hover {
          box-shadow: var(--ce-shadow-card-hover);
          transform: translateY(-2px);
        }

        mat-card-title h4 {
          font-weight: 600;
        }

        mat-card-content {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;

          .event-card__image {
            aspect-ratio: 1 / 1;
            border-radius: var(--ce-radius-md);
          }

          .event-card__image-skeleton {
            animation: skeleton-loading 1s linear infinite alternate;
            aspect-ratio: 1 / 1;
            background-color: var(--ce-skeleton);
            border-radius: var(--ce-radius-md);
            width: 152px;
          }

          .event-card__data {
            display: flex;
            flex: 1;
            flex-direction: column;

            .event-card__item {
              align-items: center;
              color: var(--ce-text-muted);
              display: flex;
              gap: 0.5rem;

              mat-icon {
                flex-shrink: 0;
                font-size: 1.25rem;
                height: 1.25rem;
                width: 1.25rem;
              }

              span {
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                display: -webkit-box;
                overflow: hidden;
                word-wrap: break-word;
              }

              &.event-card__item--description {
                color: var(--ce-text-secondary);

                span {
                  -webkit-line-clamp: 4;
                }
              }
            }
          }
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      a mat-card:hover {
        transform: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCardComponent {
  readonly event = input.required<AppEvent>();

  protected imageLoaded = signal(false);
}
