import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RecordRole } from '@core/models';
import { translations } from '@core/utils';

@Component({
  selector: 'combi-role-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="no-hint dense-2">
      <mat-label>Rol</mat-label>
      <mat-select
        [(value)]="selectedValue"
        (valueChange)="selectRoleValue.emit(selectedValue)"
      >
        <mat-option [value]="null"> Todos </mat-option>
        @for (role of roles; track role) {
          <mat-option [value]="role">
            {{ translations[role] }}
          </mat-option>
        }
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
export class RoleSelectorComponent {
  readonly roles = [
    RecordRole.Attendee,
    RecordRole.Mentor,
    RecordRole.Speaker,
    RecordRole.Sponsor,
    RecordRole.Staff,
  ];
  readonly selectedValue: RecordRole | null = null;
  readonly selectRoleValue = output<RecordRole | null>();
  readonly translations = translations;
}
