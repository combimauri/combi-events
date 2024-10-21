import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AdditionalQuestion,
  EventRecord,
  EventRecordListing,
  PageEventRecords,
} from '@core/models';
import { EventRecordsService } from '@core/services';
import { ValidatedSelectorComponent } from '@shared/components';
import { QuestionLabelPipe, TranslateBooleanPipe } from '@shared/pipes';
import { map, Observable, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'combi-event-records-table',
  standalone: true,
  imports: [
    KeyValuePipe,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    QuestionLabelPipe,
    TranslateBooleanPipe,
    ValidatedSelectorComponent,
  ],
  template: `
    <div class="event-records-table__filters">
      <combi-validated-selector
        (selectValidatedValue)="filterByValidatedValue($event)"
      />
    </div>

    <table mat-table multiTemplateDataRows [dataSource]="eventRecords()">
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
            @if (expandedElement === element) {
              <mat-icon fontIcon="keyboard_arrow_up" />
            } @else {
              <mat-icon fontIcon="keyboard_arrow_down" />
            }
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
    <mat-paginator
      [length]="recordsTotal"
      [pageIndex]="pageIndex"
      [pageSize]="pageSize"
      [pageSizeOptions]="[1, 5, 10, 15, 20, 50, 100]"
      (page)="
        handlePageChange(
          $event,
          eventRecords()[0],
          eventRecords()[eventRecords().length - 1]
        )
      "
    ></mat-paginator>
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
    .event-records-table__filters {
      display: flex;
      justify-content: flex-end;
    }

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
  readonly #eventRecordsService = inject(EventRecordsService);
  readonly #pageEventRecords$ = new Subject<PageEventRecords>();
  readonly #isHandset$ = inject(BreakpointObserver)
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  pageIndex = 0;
  pageSize = 15;
  recordsTotal = 100;
  expandedElement: EventRecord | null = null;
  translations: Record<string, string> = {
    email: 'Correo Electrónico',
    fullName: 'Nombre Completo',
    validated: 'Validado',
  };
  filters: Record<string, unknown> = {
    validated: null,
  };

  readonly additionalQuestions = input.required<AdditionalQuestion[]>();
  readonly eventId = input.required<string>();
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
  readonly eventRecords = toSignal(
    this.#pageEventRecords$.pipe(
      switchMap((pageRecords) => this.loadRecords(pageRecords)),
    ),
    { initialValue: [] },
  );

  constructor() {
    effect(() => this.loadFirstEventRecords(this.eventId()));
  }

  toggleExpand(element: EventRecord): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  handlePageChange(
    { pageIndex, pageSize, previousPageIndex }: PageEvent,
    firstRecord: EventRecord,
    lastRecord: EventRecord,
  ): void {
    const eventId = this.eventId();
    const previousPageSize = this.pageSize;
    this.pageSize = pageSize;
    this.pageIndex = pageIndex;
    previousPageIndex = previousPageIndex ?? 0;

    if (pageIndex === previousPageIndex || pageSize !== previousPageSize) {
      this.#pageEventRecords$.next({ eventId });
    } else if (pageIndex > previousPageIndex) {
      this.#pageEventRecords$.next({ eventId, lastRecord });
    } else {
      this.#pageEventRecords$.next({ eventId, firstRecord });
    }
  }

  filterByValidatedValue(validated: boolean | null): void {
    this.filters['validated'] = validated;

    this.resetTable();
  }

  private resetTable(): void {
    const eventId = this.eventId();
    this.pageIndex = 0;

    this.#pageEventRecords$.next({ eventId });
  }

  private getDisplayedColumns(isHandset: boolean): string[] {
    if (isHandset) {
      return ['fullName', 'validated'];
    }

    return ['email', 'fullName', 'validated'];
  }

  private loadFirstEventRecords(eventId: string): void {
    if (!eventId) {
      return;
    }

    queueMicrotask(() => this.#pageEventRecords$.next({ eventId }));
  }

  private loadRecords({
    eventId,
    firstRecord,
    lastRecord,
  }: PageEventRecords): Observable<EventRecord[]> {
    if (lastRecord) {
      return this.#eventRecordsService
        .getNextPageOfRecordsByEventId(
          eventId,
          lastRecord.id,
          this.pageSize,
          this.filters,
        )
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    } else if (firstRecord) {
      return this.#eventRecordsService
        .getPreviousPageOfRecordsByEventId(
          eventId,
          firstRecord.id,
          this.pageSize,
          this.filters,
        )
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    }

    return this.#eventRecordsService
      .getFirstPageOfRecordsByEventId(eventId, this.pageSize, this.filters)
      .pipe(map((listing) => this.handleLoadRecordListing(listing)));
  }

  private handleLoadRecordListing(
    listing: EventRecordListing | undefined,
  ): EventRecord[] {
    this.recordsTotal = listing?.total ?? 0;

    return listing?.items ? [...listing.items] : [];
  }
}
