import { useState, useEffect } from "react";

export const useTablePagination = (totalCount: number) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    function calculateRowsPerPage() {
      const maxHeight = window.innerHeight * 0.6; // 60vh
      const headerHeight = 56; // Table header
      const paginationHeight = 64; // Pagination footer
      const extra = 24; // Buffer for borders/margins
      const availableHeight = maxHeight - headerHeight - paginationHeight - extra;
      const rowHeight = 48;
      let rows = Math.floor(availableHeight / rowHeight);
      rows = Math.max(3, Math.min(100, rows));
      setRowsPerPage(rows);
    }
    
    calculateRowsPerPage();
    window.addEventListener("resize", calculateRowsPerPage);
    return () => window.removeEventListener("resize", calculateRowsPerPage);
  }, []);

  // Compute rowsPerPageOptions to always include the current value
  const defaultRowsPerPageOptions = [5, 10, 25, 50, 100];
  const rowsPerPageOptions = Array.from(
    new Set([...defaultRowsPerPageOptions, rowsPerPage])
  ).sort((a, b) => a - b);

  return {
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    rowsPerPageOptions,
  };
}; 