import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';

@Component({
  selector: 'combi-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet],
  template: `
    <combi-layout>
      <router-outlet />
    </combi-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
