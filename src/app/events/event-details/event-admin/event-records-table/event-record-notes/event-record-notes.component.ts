import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, of, tap } from 'rxjs';

@Component({
  selector: 'combi-event-record-notes',
  standalone: true,
  imports: [MatFormField, MatInputModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="notesForm">
      <mat-form-field appearance="outline" class="no-hint dense-2">
        <mat-label>Notas</mat-label>
        <textarea
          matInput
          type="text"
          formControlName="notes"
          rows="5"
        ></textarea>
      </mat-form-field>
    </form>
  `,
  styles: `
    :host {
      padding: 0.5rem;
    }

    mat-form-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRecordNotesComponent {
  readonly notes = input<string>();
  readonly notesChange = output<string>();

  readonly notesForm = inject(FormBuilder).group({
    notes: [''],
  });
  readonly notesWatcher = toSignal(
    this.notesForm.get('notes')?.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      tap((notes) => this.notesChange.emit(notes ?? '')),
    ) ?? of(),
  );

  constructor() {
    effect(() => this.setNotes(this.notes()));
  }

  private setNotes(notes?: string): void {
    if (!notes) {
      return;
    }

    const notesControl = this.notesForm.get('notes');

    notesControl?.setValue(notes, { emitEvent: false });
    notesControl?.markAsTouched();
  }
}
