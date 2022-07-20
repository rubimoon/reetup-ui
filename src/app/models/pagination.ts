export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T;
  pagination: Pagination;
}

export interface PagingParams {
  pageNumber?: number;
  pageSize?: number;
}

// export class PagingParams {
//   pageNumber;
//   pageSize;

//   constructor(pageNumber = 1, pageSize = 2) {
//     this.pageNumber = pageNumber;
//     this.pageSize = pageSize;
//   }
// }
