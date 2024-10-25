import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, of, tap } from 'rxjs';

@Component({
  selector: 'combi-search-box',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="searchBoxForm">
      <mat-form-field appearance="outline">
        <mat-label>Buscar</mat-label>
        <input matInput type="search" formControlName="term" />
      </mat-form-field>
    </form>
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
export class SearchBoxComponent {
  readonly searchBoxForm = inject(FormBuilder).group({
    term: [''],
  });
  readonly searchWatcher = toSignal(
    this.searchBoxForm.get('term')?.valueChanges.pipe(
      debounceTime(500),
      tap((term) => this.search.emit(term ?? '')),
    ) ?? of(),
  );
  readonly search = output<string>();
}
