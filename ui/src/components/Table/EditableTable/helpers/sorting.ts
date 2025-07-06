/**
 * Sorts data based on column and direction
 */
export const sortData = <T>(
  data: T[],
  orderBy: keyof T,
  order: "asc" | "desc",
  columns: Array<{ field: keyof T; sortable?: boolean }>,
): T[] => {
  const column = columns.find((col) => col.field === orderBy);
  if (!column || column.sortable === false) return data;

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (
      Object.prototype.toString.call(aValue) === "[object Date]" &&
      Object.prototype.toString.call(bValue) === "[object Date]"
    ) {
      return order === "asc"
        ? ((aValue as unknown) as Date).getTime() - ((bValue as unknown) as Date).getTime()
        : ((bValue as unknown) as Date).getTime() - ((aValue as unknown) as Date).getTime();
    }

    return 0;
  });

  return sortedData;
};

/**
 * Paginates data based on page and rows per page
 */
export const paginateData = <T>(
  data: T[],
  page: number,
  rowsPerPage: number,
): T[] => {
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return data.slice(startIndex, endIndex);
}; 