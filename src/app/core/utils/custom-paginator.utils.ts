import { MatPaginatorIntl } from '@angular/material/paginator';

export const customPaginator = () => {
  const customPaginatorIntl = new MatPaginatorIntl();
  customPaginatorIntl.itemsPerPageLabel = 'Elementos por página:';
  customPaginatorIntl.nextPageLabel = 'Siguiente página';
  customPaginatorIntl.previousPageLabel = 'Página anterior';
  customPaginatorIntl.firstPageLabel = 'Primera página';
  customPaginatorIntl.lastPageLabel = 'Última página';

  return customPaginatorIntl;
}
