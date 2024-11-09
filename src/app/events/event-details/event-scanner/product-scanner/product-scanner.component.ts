import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'combi-product-scanner',
  standalone: true,
  imports: [ZXingScannerModule],
  template: ` <zxing-scanner /> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductScannerComponent {}
