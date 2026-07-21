import { useState } from "react";

export const useExpandedRows = () => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleExpandedRow = (rowId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const expandRow = (rowId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: true,
    }));
  };

  const collapseRow = (rowId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: false,
    }));
  };

  const isRowExpanded = (rowId: number): boolean => {
    return !!expandedRows[rowId];
  };

  return {
    expandedRows,
    toggleExpandedRow,
    expandRow,
    collapseRow,
    isRowExpanded,
  };
}; 