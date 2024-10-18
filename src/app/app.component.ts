import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from '@core/layout';

@Component({
  selector: 'combi-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet],
  template: `
    <combi-layout>
      <router-outlet />
    </combi-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
