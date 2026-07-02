import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models';

@Component({
  selector: 'combi-product-card',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatRippleModule,
    NgTemplateOutlet,
    RouterLink,
  ],
  template: `
    @if (openMarketplace()) {
      <a matRipple [routerLink]="['/', eventId(), 'marketplace', product().id]">
        <ng-template *ngTemplateOutlet="productCard" />
      </a>
    } @else {
      <ng-template *ngTemplateOutlet="productCard" />
    }

    <ng-template #productCard>
      <mat-card appearance="outlined">
        <img
          mat-card-image
          [alt]="product().name"
          [src]="product().image"
          [hidden]="!imageLoaded()"
          (load)="imageLoaded.set(true)"
        />
        @if (!imageLoaded()) {
          <div class="product-card__skeleton"></div>
        }
        <mat-card-content>
          <h6 [class.line-through]="!openMarketplace()">
            {{ product().name }}
          </h6>
          <p [class.line-through]="!openMarketplace()">
            {{ product().description }}
          </p>
        </mat-card-content>
      </mat-card>
    </ng-template>
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
      }
    }

    @media (prefers-reduced-motion: reduce) {
      a mat-card:hover {
        transform: none;
      }
    }

    mat-card {
      margin-bottom: 1.75rem;

      .line-through {
        text-decoration: line-through;
      }

      .product-card__skeleton {
        animation: skeleton-loading 1s linear infinite alternate;
        background-color: var(--ce-skeleton);
        border-radius: var(--ce-radius-lg) var(--ce-radius-lg) 0 0;
        height: 300px;
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  eventId = input.required<string>();
  openMarketplace = input.required<boolean>();
  product = input.required<Product>();
  imageLoaded = signal(false);
}
