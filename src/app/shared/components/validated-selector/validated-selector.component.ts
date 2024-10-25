import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'combi-validated-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="no-hint dense-2">
      <mat-label>Estado</mat-label>
      <mat-select
        [(value)]="selectedValue"
        (valueChange)="selectValidatedValue.emit(selectedValue)"
      >
        <mat-option [value]="null"> Todos </mat-option>
        <mat-option [value]="true"> Validado </mat-option>
        <mat-option [value]="false"> No Validado </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: `
    :host,
    mat-form-field {
      width: 100%;

      @media (min-width: 960px) {
        width: inherit;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidatedSelectorComponent {
  readonly selectedValue: boolean | null = null;
  readonly selectValidatedValue = output<boolean | null>();
}
