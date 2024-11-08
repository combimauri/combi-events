import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Listing, SessionRecord } from '@core/models';
import { SessionRecordsService } from '@core/services';
import { EventState } from '@core/states';
import { translations } from '@core/utils';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'combi-event-sessions-table',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
  ],
  template: `
    <table
      mat-table
      matSort
      [dataSource]="sessionRecords()"
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
            } @else {
              {{ element[column] }}
            }
          </td>
        </ng-container>
      }

      <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
    </table>
    <mat-paginator
      [length]="recordsTotal()"
      [pageIndex]="tableState()!.page.pageIndex"
      [pageSize]="tableState()!.page.pageSize"
      [pageSizeOptions]="[1, 5, 10, 15, 20, 50, 100]"
      (page)="
        handlePageChange(
          $event,
          sessionRecords()[0],
          sessionRecords()[sessionRecords().length - 1]
        )
      "
    ></mat-paginator>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSessionsTableComponent {
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #eventState = inject(EventState);
  readonly #sessionRecordsService = inject(SessionRecordsService);

  readonly #isHandset$ = this.#breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  readonly #event$ = toObservable(this.#eventState.event);
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
  readonly #sessionRecords$ = combineLatest([
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

        return this.#sessionRecordsService
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

  readonly displayedColumns = toSignal(
    this.#isHandset$.pipe(
      map((isHandset) => this.getDisplayedColumns(isHandset)),
    ),
    { initialValue: [] },
  );
  readonly expandedElement = signal<SessionRecord | null>(null);
  readonly tableState = toSignal(this.#tableState$);
  readonly recordsTotal = signal(0);
  readonly sessionRecords = toSignal(this.#sessionRecords$, {
    initialValue: [],
  });
  readonly translations = translations;

  toggleExpand(element: SessionRecord): void {
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
    firstRecord: SessionRecord,
    lastRecord: SessionRecord,
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

  private getDisplayedColumns(isHandset: boolean): string[] {
    if (isHandset) {
      return ['fullName', 'sessionName'];
    }

    return ['createdAt', 'email', 'fullName', 'sessionName'];
  }

  private handleLoadRecordListing(
    listing: Listing<SessionRecord> | undefined,
  ): SessionRecord[] {
    this.recordsTotal.set(listing?.total ?? 0);

    return listing?.items ? [...listing.items] : [];
  }
}
