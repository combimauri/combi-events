import { Pipe, PipeTransform } from '@angular/core';
import { AdditionalRegistry, Registry, Session } from '@core/models';

@Pipe({
  name: 'registryLabel',
  standalone: true,
})
export class RegistryLabelPipe implements PipeTransform {
  readonly #labels: Record<Registry, string> = {
    [Registry.Entry]: 'Entrada',
    [Registry.Product]: 'Producto',
    [Registry.Session]: 'Taller',
  };

  transform(
    value: Registry | AdditionalRegistry,
    sessionForScan: Session | null,
  ): string {
    if (this.isAdditionalRegistry(value)) {
      return value.label;
    }

    const label = this.#labels[value] || '';

    if (value === Registry.Session && sessionForScan) {
      return `${label} - ${sessionForScan.name}`;
    }

    return label;
  }

  private isAdditionalRegistry(
    registry: Registry | AdditionalRegistry,
  ): registry is AdditionalRegistry {
    return !!(registry as AdditionalRegistry).key;
  }
}
