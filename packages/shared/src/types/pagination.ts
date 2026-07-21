/**
 * Shared pagination types used by both API responses
 * and frontend data fetching.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  [key: string]: string | undefined;
}
