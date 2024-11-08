import { inject } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  DocumentData,
  endBefore,
  Firestore,
  getCountFromServer,
  getDoc,
  limit,
  limitToLast,
  orderBy,
  Query,
  query,
  startAfter,
  where,
} from '@angular/fire/firestore';
import { Sort } from '@angular/material/sort';
import { Listing } from '@core/models';
import { handleError, loadEffect } from '@core/utils';
import { catchError, from, map, Observable, switchMap, take, tap } from 'rxjs';
import { LoggerService } from './logger.service';

export abstract class TableRecordsService<T> {
  protected collectionName = '';
  protected idColumn = '';
  protected readonly firestore = inject(Firestore);
  protected readonly loadEffectObserver = loadEffect();
  protected readonly logger = inject(LoggerService);

  getRecords(
    id: string,
    pageSize: number,
    { active, direction }: Sort,
    searchTerm: string,
    filters: Record<string, unknown>,
    firstVisibleRecordId?: string,
    lastVisibleRecordId?: string,
  ): Observable<Listing<T> | undefined> {
    if (lastVisibleRecordId) {
      return this.getNextPageOfRecordsByRecordId(
        id,
        lastVisibleRecordId,
        pageSize,
        { active, direction },
        searchTerm,
        filters,
      );
    } else if (firstVisibleRecordId) {
      return this.getPreviousPageOfRecordsByRecordId(
        id,
        firstVisibleRecordId,
        pageSize,
        { active, direction },
        searchTerm,
        filters,
      );
    }

    return this.getFirstPageOfRecordsByRecordId(
      id,
      pageSize,
      { active, direction },
      searchTerm,
      filters,
    );
  }

  private getFirstPageOfRecordsByRecordId(
    id: string,
    pageSize: number,
    { active, direction }: Sort,
    searchTerm: string,
    filters: Record<string, unknown>,
  ): Observable<Listing<T> | undefined> {
    const directionToSort = direction === 'asc' ? 'asc' : 'desc';
    const recordsCollection = query(
      collection(this.firestore, this.collectionName),
    );
    let recordsQuery = query(recordsCollection);
    recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
    recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);
    recordsQuery = query(
      recordsQuery,
      where(this.idColumn, '==', id),
      orderBy(active, directionToSort),
      limit(pageSize),
    );

    return (collectionData(recordsQuery) as Observable<T[]>).pipe(
      tap(this.loadEffectObserver),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(id, searchTerm, filters).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  private getNextPageOfRecordsByRecordId(
    id: string,
    lastVisibleRecordId: string,
    pageSize: number,
    { active, direction }: Sort,
    searchTerm: string,
    filters: Record<string, unknown>,
  ): Observable<Listing<T> | undefined> {
    const directionToSort = direction === 'asc' ? 'asc' : 'desc';
    const recordsRef = collection(this.firestore, this.collectionName);
    const lastDoc = from(getDoc(doc(recordsRef, lastVisibleRecordId)));

    return lastDoc.pipe(
      tap(this.loadEffectObserver),
      switchMap((docSnapshot) => {
        const recordsCollection = query(recordsRef);
        let recordsQuery = query(recordsCollection);
        recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
        recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);
        recordsQuery = query(
          recordsQuery,
          where(this.idColumn, '==', id),
          orderBy(active, directionToSort),
          startAfter(docSnapshot),
          limit(pageSize),
        );

        return collectionData(recordsQuery) as Observable<T[]>;
      }),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(id, searchTerm, filters).pipe(
          map((total) => ({ items, total })),
        ),
      ),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  private getPreviousPageOfRecordsByRecordId(
    id: string,
    firstVisibleRecordId: string,
    pageSize: number,
    { active, direction }: Sort,
    searchTerm: string,
    filters: Record<string, unknown>,
  ): Observable<Listing<T> | undefined> {
    const directionToSort = direction === 'asc' ? 'asc' : 'desc';
    const recordsRef = collection(this.firestore, this.collectionName);
    const firstDoc = from(getDoc(doc(recordsRef, firstVisibleRecordId)));

    return firstDoc.pipe(
      tap(this.loadEffectObserver),
      switchMap((docSnapshot) => {
        const recordsCollection = query(recordsRef);
        let recordsQuery = query(recordsCollection);
        recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
        recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);
        recordsQuery = query(
          recordsQuery,
          where(this.idColumn, '==', id),
          orderBy(active, directionToSort),
          endBefore(docSnapshot),
          limitToLast(pageSize),
        );

        return collectionData(recordsQuery) as Observable<T[]>;
      }),
      take(1),
      switchMap((items) =>
        this.getRecordsCount(
          id,

          searchTerm,
          filters,
        ).pipe(map((total) => ({ items, total }))),
      ),
      catchError((error) => handleError(error, this.logger)),
    );
  }

  private addSearchTermToQuery(
    dbQuery: Query<DocumentData>,
    searchTerm: string,
  ): Query<DocumentData> {
    if (!searchTerm) {
      return dbQuery;
    }

    return query(
      dbQuery,
      where('searchTerm', '>=', searchTerm),
      where('searchTerm', '<=', searchTerm + '\uf8ff'),
    );
  }

  private getRecordsCount(
    id: string,
    searchTerm: string,
    filters: Record<string, unknown>,
  ): Observable<number> {
    const recordsCollection = query(
      collection(this.firestore, this.collectionName),
    );
    let recordsQuery = query(recordsCollection, where(this.idColumn, '==', id));
    recordsQuery = this.addFiltersToQuery(recordsQuery, filters);
    recordsQuery = this.addSearchTermToQuery(recordsQuery, searchTerm);

    return from(getCountFromServer(recordsQuery)).pipe(
      map((snapshot) => snapshot.data().count),
    );
  }

  private addFiltersToQuery(
    dbQuery: Query<DocumentData>,
    filters?: Record<string, unknown>,
  ): Query<DocumentData> {
    if (!filters) {
      return dbQuery;
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null) {
        dbQuery = query(dbQuery, where(key, '==', value));
      }
    }

    return dbQuery;
  }
}
