import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
        <img mat-card-image [alt]="product().name" [src]="product().image" />
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
      color: inherit;
      text-decoration: none;

      mat-card {
        transition: all 0.3s;

        &:hover {
          background-color: #cbc4d0;
        }
      }
    }

    mat-card {
      margin-bottom: 1.75rem;

      .line-through {
        text-decoration: line-through;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  eventId = input.required<string>();
  openMarketplace = input.required<boolean>();
  product = input.required<Product>();
}
