import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';
import { EventRecord } from '../../../../core/models/event-record.model';
import { AdditionalQuestion } from '../../../../core/models/additional-question.model';
import { QuestionLabelPipe } from '../../../../shared/pipes/question-label.pipe';
import { TranslateBooleanPipe } from '../../../../shared/pipes/translate-boolean.pipe';

@Component({
  selector: 'combi-event-records-table',
  standalone: true,
  imports: [
    KeyValuePipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    QuestionLabelPipe,
    TranslateBooleanPipe,
  ],
  template: `
    <table
      mat-table
      multiTemplateDataRows
      [dataSource]="eventRecordsObservable()"
    >
      @for (column of displayedColumns(); track column) {
        <ng-container [matColumnDef]="column">
          <th mat-header-cell *matHeaderCellDef>{{ translations[column] }}</th>
          <td mat-cell *matCellDef="let element">
            {{ element[column] | translateBoolean }}
          </td>
        </ng-container>
      }

      <ng-container matColumnDef="expand">
        <th mat-header-cell *matHeaderCellDef>&nbsp;</th>
        <td mat-cell *matCellDef="let element">
          <button
            mat-icon-button
            (click)="toggleExpand(element); $event.stopPropagation()"
          >
            <mat-icon>
              @if (expandedElement === element) {
                keyboard_arrow_up
              } @else {
                keyboard_arrow_down
              }
            </mat-icon>
          </button>
        </td>
      </ng-container>

      <ng-container matColumnDef="expandedDetail">
        <td
          mat-cell
          *matCellDef="let element"
          [attr.colspan]="displayedColumnsWithExpand().length"
        >
          <div
            class="element-detail"
            [@detailExpand]="
              element == expandedElement ? 'expanded' : 'collapsed'
            "
          >
            <dl>
              @if (isHandset()) {
                <dt>Correo Electrónico</dt>
                <dd>{{ element.email }}</dd>
              }

              <dt>Número de Teléfono</dt>
              <dd>
                {{ element.phoneNumber }}
              </dd>

              @for (
                item of element.additionalAnswers | keyvalue;
                track item.key
              ) {
                <dt>{{ item.key | questionLabel: additionalQuestions() }}</dt>
                <dd>
                  {{ item.value || 'N/A' }}
                </dd>
              }
            </dl>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumnsWithExpand()"></tr>
      <tr
        mat-row
        *matRowDef="let element; columns: displayedColumnsWithExpand()"
        class="element-row"
        (click)="toggleExpand(element)"
      ></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: ['expandedDetail']"
        class="detail-row"
      ></tr>
    </table>
  `,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
  styles: `
    tr.detail-row {
      height: 0;
    }

    tr.element-row:not(.expanded-row):hover {
      background-color: whitesmoke;
    }

    tr.element-row:not(.expanded-row):active {
      background-color: #efefef;
    }

    .element-row td {
      border-bottom-width: 0;
    }

    .element-detail {
      overflow: hidden;
      display: flex;

      dt {
        font-weight: bold;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRecordsTableComponent {
  readonly #isHandset$ = inject(BreakpointObserver)
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  expandedElement: EventRecord | null = null;
  translations: Record<string, string> = {
    email: 'Correo Electrónico',
    fullName: 'Nombre Completo',
    validated: 'Validado',
  };

  readonly additionalQuestions = input.required<AdditionalQuestion[]>();
  readonly eventRecordsObservable = input.required<Observable<EventRecord[]>>();
  readonly isHandset = toSignal(this.#isHandset$);
  readonly displayedColumns = toSignal(
    this.#isHandset$.pipe(
      map((isHandset) => this.getDisplayedColumns(isHandset)),
    ),
    { initialValue: [] },
  );
  readonly displayedColumnsWithExpand = computed(() =>
    this.displayedColumns().concat('expand'),
  );

  toggleExpand(element: EventRecord): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  private getDisplayedColumns(isHandset: boolean): string[] {
    if (isHandset) {
      return ['fullName', 'validated'];
    }

    return ['email', 'fullName', 'validated'];
  }
}
