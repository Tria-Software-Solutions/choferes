import { useState, useCallback, useMemo } from "react";

/**
 * Custom hook for managing table data with filtering and pagination
 */
export function useTableData<T extends Record<string, unknown>>(items: T[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof T | "">("");

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [items, searchTerm]);

  // Sort items
  const sortedItems = useMemo(() => {
    if (!orderBy) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, order, orderBy]);

  // Paginate items
  const paginatedItems = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedItems.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(0);
  }, []);

  const handleSort = useCallback((column: keyof T) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  }, [order, orderBy]);

  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  return {
    items: paginatedItems,
    totalCount: filteredItems.length,
    searchTerm,
    page,
    rowsPerPage,
    order,
    orderBy,
    handleSearch,
    handleSort,
    handleChangePage,
    handleChangeRowsPerPage,
  };
}
