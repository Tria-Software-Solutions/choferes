import { useState, useEffect, useRef } from 'react';

interface TableDimensions {
  maxHeight: number;
  rowsPerPage: number;
}

/**
 * Hook for calculating responsive table height and rows per page
 * based on available viewport space
 */
export const useResponsiveTableHeight = (
  appBarHeight: number = 64,
  pagePadding: number = 0,
  headerHeight: number = 120,
  footerHeight: number = 56,
  rowHeight: number = 48,
  bufferHeight: number = 16
): TableDimensions => {
  const [dimensions, setDimensions] = useState<TableDimensions>({
    maxHeight: 400,
    rowsPerPage: 5,
  });
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const calculateDimensions = () => {
      if (typeof window === 'undefined') {
        return;
      }

      // Calculate available height
      // Total viewport height - AppBar - page padding - header - footer - buffer
      const availableHeight =
        window.innerHeight -
        appBarHeight -
        pagePadding * 2 - // top and bottom padding
        headerHeight -
        footerHeight -
        bufferHeight;

      // Calculate rows per page
      const calculatedRows = Math.floor(availableHeight / rowHeight);
      const rowsPerPage = Math.max(5, Math.min(100, calculatedRows));

      setDimensions({
        maxHeight: availableHeight,
        rowsPerPage,
      });
    };

    calculateDimensions();

    // Handle window resize with debounce
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(calculateDimensions, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [appBarHeight, pagePadding, headerHeight, footerHeight, rowHeight, bufferHeight]);

  return dimensions;
};
