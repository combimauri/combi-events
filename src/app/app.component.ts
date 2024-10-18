import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from '@core/layout';
import { isWebView } from '@core/utils';

@Component({
  selector: 'combi-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet],
  template: `
    <combi-layout>
      WebView: {{ isWebView }}
      <router-outlet />
    </combi-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  isWebView = isWebView();
}
