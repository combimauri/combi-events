import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'combi-credential',
  standalone: true,
  imports: [QRCodeModule],
  template: `
    <qrcode
      elementType="img"
      errorCorrectionLevel="M"
      [margin]="0"
      [qrdata]="recordCode()"
      [width]="width()"
      (qrCodeURL)="downloadLink.set($event)"
    ></qrcode>

    <a #downloadAnchor hidden download="credencial" [href]="downloadLink()"></a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialComponent {
  readonly #platformId = inject(PLATFORM_ID);
  readonly recordCode = input.required<string>();
  readonly width = input(256);

  readonly downloadAnchor = viewChild.required<ElementRef>('downloadAnchor');

  readonly downloadLink = signal<SafeUrl>('');

  download(): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    this.downloadAnchor().nativeElement.click();
  }
}
