import { useEffect, type RefObject } from "react";

/**
 * Hook for managing responsive layout in SelectorTable
 */
export const useSelectorTableLayout = (
  setRowsPerPage: (rows: number) => void,
  tableContainerRef: RefObject<HTMLDivElement>,
  tableHeadRef: RefObject<HTMLTableSectionElement>,
  paginationRef: RefObject<HTMLDivElement>,
  isSmallScreen: boolean
) => {
  useEffect(() => {
    const calculateRowsPerPage = () => {
      const headHeight = tableHeadRef.current
        ? tableHeadRef.current.getBoundingClientRect().height
        : 56;
      const paginationHeight = paginationRef.current
        ? paginationRef.current.getBoundingClientRect().height
        : 64;
      const containerHeight = tableContainerRef.current
        ? tableContainerRef.current.clientHeight
        : window.innerHeight * 0.55;
      const buffer = 16;
      const availableHeight = containerHeight - headHeight - paginationHeight - buffer;
      const rowHeight = 48;
      let rows = Math.floor(availableHeight / rowHeight);
      rows = Math.max(5, Math.min(100, rows));
      setRowsPerPage(rows);
    };

    calculateRowsPerPage();

    const containerElement = tableContainerRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && containerElement
        ? new ResizeObserver(calculateRowsPerPage)
        : null;

    if (resizeObserver && containerElement) {
      resizeObserver.observe(containerElement);
    }

    window.addEventListener("resize", calculateRowsPerPage);

    return () => {
      window.removeEventListener("resize", calculateRowsPerPage);
      if (resizeObserver && containerElement) {
        resizeObserver.unobserve(containerElement);
        resizeObserver.disconnect();
      }
    };
  }, [isSmallScreen, setRowsPerPage, tableContainerRef, tableHeadRef, paginationRef]);

  useEffect(() => {
    if (isSmallScreen) {
      setRowsPerPage(5);
    }
  }, [isSmallScreen, setRowsPerPage]);
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
  const maxHeight = window.innerHeight * 0.48; // 48vh
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