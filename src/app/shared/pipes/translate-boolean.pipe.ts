import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateBoolean',
  standalone: true,
})
export class TranslateBooleanPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    return value;
  }
}
