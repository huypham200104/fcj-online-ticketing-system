export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  statusCode: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
