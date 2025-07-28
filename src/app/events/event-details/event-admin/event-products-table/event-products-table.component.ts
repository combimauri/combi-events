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
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Listing, ProductRecord } from '@core/models';
import { ProductRecordsService } from '@core/services';
import { EventState } from '@core/states';
import { translations } from '@core/utils';
import { TranslateBooleanPipe } from '@shared/pipes';
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { EventRecordReceiptsComponent } from '../event-records-table/event-record-receipts/event-record-receipts.component';

@Component({
  selector: 'combi-event-products-table',
  standalone: true,
  imports: [
    DatePipe,
    EventRecordReceiptsComponent,
    KeyValuePipe,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    TranslateBooleanPipe,
  ],
  template: `
    <table
      mat-table
      multiTemplateDataRows
      matSort
      [dataSource]="productRecords()"
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
            @if (expandedElement() === element) {
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
              element === expandedElement() ? 'expanded' : 'collapsed'
            "
          >
            <dl>
              @for (
                item of element.additionalAnswers | keyvalue;
                track item.key
              ) {
                <dt>{{ item.key }}</dt>
                <dd>
                  {{ item.value || 'N/A' }}
                </dd>
              }
            </dl>
            <div class="event-products-table__expansion-actions">
              <combi-event-record-receipts
                [paymentReceipts]="element.paymentReceipts"
                [validated]="element.validated"
                (toggleValidation)="toggleValidation(element)"
              />
            </div>
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
      [length]="recordsTotal()"
      [pageIndex]="tableState()!.page.pageIndex"
      [pageSize]="tableState()!.page.pageSize"
      [pageSizeOptions]="[1, 5, 10, 15, 20, 50, 100]"
      (page)="
        handlePageChange(
          $event,
          productRecords()[0],
          productRecords()[productRecords().length - 1]
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
      flex-wrap: wrap;
      gap: 0.5rem;

      dl {
        flex-grow: 1;

        dt {
          font-weight: bold;
        }

        dd {
          align-items: center;
          display: flex;
          height: 40px;
        }
      }

      .event-products-table__expansion-actions {
        flex-grow: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventProductsTableComponent {
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #eventState = inject(EventState);
  readonly #event$ = toObservable(this.#eventState.event);
  readonly #productRecordsService = inject(ProductRecordsService);
  readonly #updateValidation$ = new Subject<{
    recordId: string;
    validated: boolean;
  }>();

  readonly #isHandset$ = this.#breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  readonly #tableState$ = new BehaviorSubject({
    filter: {},
    page: {
      pageIndex: 0,
      pageSize: 15,
      length: 0,
    },
    searchTerm: '',
    sort: {
      active: 'createdAt',
      direction: 'desc' as SortDirection,
    },
    firstRecordId: '',
    lastRecordId: '',
  });
  readonly #productRecords$ = combineLatest([
    this.#event$,
    this.#tableState$,
  ]).pipe(
    switchMap(
      ([
        event,
        { page, sort, searchTerm, filter, firstRecordId, lastRecordId },
      ]) => {
        if (!event) {
          return of([]);
        }

        return this.#productRecordsService
          .getRecords(
            event.id,
            page.pageSize,
            sort,
            searchTerm,
            filter,
            firstRecordId,
            lastRecordId,
          )
          .pipe(map((listing) => this.handleLoadRecordListing(listing)));
      },
    ),
  );

  protected readonly displayedColumns = toSignal(
    this.#isHandset$.pipe(
      map((isHandset) => this.getDisplayedColumns(isHandset)),
    ),
    { initialValue: [] },
  );
  protected readonly displayedColumnsWithExpand = computed(() =>
    this.displayedColumns().concat('expand'),
  );
  protected readonly expandedElement = signal<ProductRecord | null>(null);
  protected readonly tableState = toSignal(this.#tableState$);
  protected readonly recordsTotal = signal(0);
  protected readonly productRecords = toSignal(this.#productRecords$, {
    initialValue: [],
  });
  protected readonly translations = translations;

  protected readonly updateValidation = toSignal(
    this.#updateValidation$.pipe(
      switchMap(({ recordId, validated }) =>
        this.#productRecordsService.updateRecordValidation(recordId, validated),
      ),
    ),
  );

  toggleExpand(element: ProductRecord): void {
    this.expandedElement.update((current) =>
      current === element ? null : element,
    );
  }

  handleSortChange(sortState: Sort) {
    if (sortState.active === 'fullName') {
      sortState.active = 'searchTerm';
    }

    if (sortState.direction) {
      const tableState = this.#tableState$.value;

      this.#tableState$.next({
        ...tableState,
        sort: sortState,
        page: { ...tableState.page, pageIndex: 0 },
        firstRecordId: '',
        lastRecordId: '',
      });
    }
  }

  handlePageChange(
    { pageIndex, pageSize, previousPageIndex }: PageEvent,
    firstRecord: ProductRecord,
    lastRecord: ProductRecord,
  ): void {
    const previousPageSize = this.tableState()!.page.pageSize;
    previousPageIndex = previousPageIndex ?? 0;
    const recordIds = {
      firstRecordId: firstRecord.id,
      lastRecordId: lastRecord.id,
    };

    if (pageIndex === previousPageIndex || pageSize !== previousPageSize) {
      recordIds.firstRecordId = '';
      recordIds.lastRecordId = '';
    } else if (pageIndex > previousPageIndex) {
      recordIds.firstRecordId = '';
    } else {
      recordIds.lastRecordId = '';
    }

    this.#tableState$.next({
      ...this.tableState()!,
      page: { pageIndex, pageSize, length: this.recordsTotal() },
      ...recordIds,
    });
  }

  toggleValidation(record: ProductRecord): void {
    record.validated = !record.validated;
    const { id: recordId, validated } = record;

    this.#updateValidation$.next({ recordId, validated });
  }

  private getDisplayedColumns(isHandset: boolean): string[] {
    if (isHandset) {
      return ['fullName', 'productName', 'validated'];
    }

    return ['createdAt', 'email', 'fullName', 'productName', 'validated'];
  }

  private handleLoadRecordListing(
    listing: Listing<ProductRecord> | undefined,
  ): ProductRecord[] {
    this.recordsTotal.set(listing?.total ?? 0);

    return listing?.items ? [...listing.items] : [];
  }
}
