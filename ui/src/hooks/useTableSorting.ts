import { useState } from "react";

export type SortOrder = "asc" | "desc";

export const useTableSorting = <T extends object>(initialOrderBy: keyof T) => {
  const [order, setOrder] = useState<SortOrder>("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(initialOrderBy);

  const handleSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return { order, orderBy, handleSort };
}; 