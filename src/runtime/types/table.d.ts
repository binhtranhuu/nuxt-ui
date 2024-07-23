export interface ITableChange {
  pagination: { page?: number; pageCount?: number };
  sort: { column?: string; direction: 'asc' | 'desc' };
}
