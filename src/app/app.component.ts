import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';

@Component({
  selector: 'gdg-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet],
  template: `
    <gdg-layout>
      <router-outlet />
    </gdg-layout>
  `,
  styles: [],
})
export class AppComponent {}
