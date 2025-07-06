import { useTheme, useMediaQuery } from "@mui/material";
import { useEffect } from "react";

/**
 * Hook for managing responsive layout in SelectorTable
 */
export const useSelectorTableLayout = (
  setRowsPerPage: (rows: number) => void,
  tableHeadRef: React.RefObject<HTMLTableSectionElement>,
  paginationRef: React.RefObject<HTMLDivElement>,
) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Adjusts rows per page based on screen size
  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    } else {
      setRowsPerPage(25);
    }
  }, [isSmallScreen, setRowsPerPage]);

  useEffect(() => {
    function calculateRowsPerPage() {
      const maxHeight = window.innerHeight * 0.6; // 60vh
      const headHeight = tableHeadRef.current
        ? tableHeadRef.current.getBoundingClientRect().height
        : 56;
      const paginationHeight = paginationRef.current
        ? paginationRef.current.getBoundingClientRect().height
        : 64;
      const extra = 24; // Buffer for borders/margins
      const availableHeight = maxHeight - headHeight - paginationHeight - extra;
      const rowHeight = 48;
      let rows = Math.floor(availableHeight / rowHeight);
      rows = Math.max(3, Math.min(100, rows));
      setRowsPerPage(rows);
    }
    // Wait for layout to stabilize
    setTimeout(calculateRowsPerPage, 0);
    window.addEventListener("resize", calculateRowsPerPage);
    return () => window.removeEventListener("resize", calculateRowsPerPage);
  }, [setRowsPerPage, tableHeadRef, paginationRef]);

  return { isSmallScreen };
};

/**
 * Gets responsive styles based on screen size
 */
export const getResponsiveStyles = (isSmallScreen: boolean) => ({
  tableCell: {
    padding: isSmallScreen ? "8px" : "16px",
  },
  employeeColumn: {
    minWidth: isSmallScreen ? 120 : 200,
    maxWidth: isSmallScreen ? 150 : 250,
  },
  employeeCell: {
    flexDirection: isSmallScreen ? "column" : "row",
    gap: isSmallScreen ? 1 : 2,
  },
  stickyCell: {
    position: isSmallScreen ? "static" : "sticky",
    right: 0,
    zIndex: 2,
  },
});

/**
 * Calculates optimal rows per page based on available height
 */
export const calculateOptimalRowsPerPage = (
  tableHeadRef: React.RefObject<HTMLTableSectionElement>,
  paginationRef: React.RefObject<HTMLDivElement>,
): number => {
  const maxHeight = window.innerHeight * 0.6; // 60vh
  const headHeight = tableHeadRef.current
    ? tableHeadRef.current.getBoundingClientRect().height
    : 56;
  const paginationHeight = paginationRef.current
    ? paginationRef.current.getBoundingClientRect().height
    : 64;
  const extra = 24; // Buffer for borders/margins
  const availableHeight = maxHeight - headHeight - paginationHeight - extra;
  const rowHeight = 48;
  let rows = Math.floor(availableHeight / rowHeight);
  return Math.max(3, Math.min(100, rows));
};

/**
 * Gets default rows per page based on screen size
 */
export const getDefaultRowsPerPage = (isSmallScreen: boolean): number => {
  return isSmallScreen ? 5 : 25;
}; 