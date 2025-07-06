import { useState } from "react";
import { SortOrder, handleSortRequest } from "../utils/tableSorting";

export const useTableSorting = <T extends object>(initialOrderBy: keyof T) => {
  const [order, setOrder] = useState<SortOrder>("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(initialOrderBy);

  const handleSort = (column: keyof T) => {
    const { order: newOrder, orderBy: newOrderBy } = handleSortRequest(
      column,
      order,
      orderBy
    );
    setOrder(newOrder);
    setOrderBy(newOrderBy);
  };

  return {
    order,
    orderBy,
    handleSort,
  };
}; 