import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeUrl',
  standalone: true,
})
export class SanitizeUrlPipe implements PipeTransform {
  sanitizer = inject(DomSanitizer);

  transform(value: string | undefined): SafeResourceUrl {
    if (!value) {
      return '';
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
