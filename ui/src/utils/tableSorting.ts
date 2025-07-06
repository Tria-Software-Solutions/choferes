export type SortOrder = "asc" | "desc";

export const sortData = <T extends object>(
  data: T[],
  orderBy: keyof T,
  order: SortOrder
): T[] => {
  return [...data].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === "asc" ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });
};

export const handleSortRequest = <T extends object>(
  column: keyof T,
  currentOrder: SortOrder,
  currentOrderBy: keyof T
): { order: SortOrder; orderBy: keyof T } => {
  const isAsc = currentOrderBy === column && currentOrder === "asc";
  return {
    order: isAsc ? "desc" : "asc",
    orderBy: column,
  };
};

export const paginateData = <T>(
  data: T[],
  page: number,
  rowsPerPage: number
): T[] => {
  return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}; 