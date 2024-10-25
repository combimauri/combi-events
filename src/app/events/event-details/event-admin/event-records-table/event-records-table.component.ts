import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe, KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
  AdditionalQuestion,
  EventRecord,
  EventRecordListing,
  PageEventRecords,
  RecordRole,
} from '@core/models';
import { EventRecordsService } from '@core/services';
import { translations } from '@core/utils';
import {
  RoleSelectorComponent,
  SearchBoxComponent,
  ValidatedSelectorComponent,
} from '@shared/components';
import { QuestionLabelPipe, TranslateBooleanPipe } from '@shared/pipes';
import { map, Observable, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'combi-event-records-table',
  standalone: true,
  imports: [
    DatePipe,
    KeyValuePipe,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    QuestionLabelPipe,
    RoleSelectorComponent,
    SearchBoxComponent,
    TranslateBooleanPipe,
    ValidatedSelectorComponent,
  ],
  template: `
    <div class="event-records-table__filters">
      <combi-search-box (search)="searchRecord($event)" />
      <combi-role-selector (selectRoleValue)="filterByRoleValue($event)" />
      <combi-validated-selector
        (selectValidatedValue)="filterByValidatedValue($event)"
      />
    </div>

    <table
      mat-table
      multiTemplateDataRows
      matSort
      [dataSource]="eventRecords()"
      (matSortChange)="handleSortChange($event)"
    >
      @for (column of displayedColumns(); track column) {
        <ng-container [matColumnDef]="column">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            {{ translations[column] }}
          </th>
          <td mat-cell *matCellDef="let element">
            @if (column === 'createdAt') {
              {{ element[column].toDate() | date: 'dd/MM/yy HH:mm' }}
            } @else if (column === 'role') {
              {{ translations[element[column]] }}
            } @else if (column === 'validated') {
              {{ element[column] | translateBoolean }}
            } @else {
              {{ element[column] }}
            }
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
                <dt>Creado</dt>
                <dd>
                  {{ element.createdAt.toDate() | date: 'dd/MM/yy HH:mm' }}
                </dd>

                <dt>Rol</dt>
                <dd>{{ translations[element.role] }}</dd>

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
      flex-wrap: wrap;
      gap: 0.25rem;
      justify-content: flex-end;
    }

    th,
    td {
      font-size: 0.75rem;
      padding: 0 0.5rem;
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
  recordsTotal = 0;
  searchTerm = '';
  sortState: Sort = { active: 'createdAt', direction: 'desc' };
  expandedElement: EventRecord | null = null;
  filters: Record<string, unknown> = {
    validated: null,
  };

  readonly additionalQuestions = input.required<AdditionalQuestion[]>();
  readonly eventId = input.required<string>();
  readonly isHandset = toSignal(this.#isHandset$);
  readonly translations = translations;

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

  searchRecord(term: string | Event): void {
    if (typeof term !== 'string') {
      return;
    }

    this.searchTerm = term.replace(/\s/g, '').toLowerCase();

    this.resetTable();
  }

  handleSortChange(sortState: Sort) {
    this.sortState = sortState;

    if (this.sortState.active === 'fullName') {
      this.sortState.active = 'searchTerm';
    }

    if (sortState.direction) {
      this.resetTable();
    }
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

  filterByRoleValue(role: RecordRole | null): void {
    this.filters['role'] = role;

    this.resetTable();
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

    return ['createdAt', 'email', 'fullName', 'role', 'validated'];
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
          this.sortState,
          this.searchTerm,
          this.filters,
        )
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    } else if (firstRecord) {
      return this.#eventRecordsService
        .getPreviousPageOfRecordsByEventId(
          eventId,
          firstRecord.id,
          this.pageSize,
          this.sortState,
          this.searchTerm,
          this.filters,
        )
        .pipe(map((listing) => this.handleLoadRecordListing(listing)));
    }

    return this.#eventRecordsService
      .getFirstPageOfRecordsByEventId(
        eventId,
        this.pageSize,
        this.sortState,
        this.searchTerm,
        this.filters,
      )
      .pipe(map((listing) => this.handleLoadRecordListing(listing)));
  }

  private handleLoadRecordListing(
    listing: EventRecordListing | undefined,
  ): EventRecord[] {
    this.recordsTotal = listing?.total ?? 0;

    return listing?.items ? [...listing.items] : [];
  }
}
