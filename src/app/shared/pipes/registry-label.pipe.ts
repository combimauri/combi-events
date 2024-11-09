import { Pipe, PipeTransform } from '@angular/core';
import { Registry, Session } from '@core/models';

@Pipe({
  name: 'registryLabel',
  standalone: true,
})
export class RegistryLabelPipe implements PipeTransform {
  readonly #labels: Record<Registry, string> = {
    [Registry.Entry]: 'Registrar Entrada',
    [Registry.Product]: 'Registrar Producto',
    [Registry.Session]: 'Registrar Taller',
  };

  transform(value: Registry, sessionForScan: Session | null): string {
    const label = this.#labels[value] || '';

    if (value === Registry.Session && sessionForScan) {
      return `${label} - ${sessionForScan.name}`;
    }

    return label;
  }
}
