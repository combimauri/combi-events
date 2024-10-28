import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models';

@Component({
  selector: 'combi-product-card',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatRippleModule, RouterLink],
  template: `
    <a matRipple [routerLink]="['/', eventId(), 'marketplace', product().id]">
      <mat-card appearance="outlined">
        <img mat-card-image [alt]="product().name" [src]="product().image" />
        <mat-card-content>
          <h6>
            {{ product().name }}
          </h6>
          <p>
            {{ product().description }}
          </p>
        </mat-card-content>
      </mat-card>
    </a>
  `,
  styles: `
    a {
      color: inherit;
      text-decoration: none;

      mat-card {
        margin-bottom: 1.75rem;
        transition: all 0.3s;

        &:hover {
          background-color: #cbc4d0;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  eventId = input.required<string>();
  product = input.required<Product>();
}
