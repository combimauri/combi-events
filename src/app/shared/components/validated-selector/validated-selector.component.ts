import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'combi-validated-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Validado</mat-label>
      <mat-select
        [(value)]="selectedValue"
        (valueChange)="selectValidatedValue.emit(selectedValue)"
      >
        <mat-option [value]="null"> </mat-option>
        <mat-option [value]="true"> Sí </mat-option>
        <mat-option [value]="false"> No </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidatedSelectorComponent {
  selectedValue: boolean | null = null;
  selectValidatedValue = output<boolean | null>();
}
