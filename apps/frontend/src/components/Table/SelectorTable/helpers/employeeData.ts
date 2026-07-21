import { Employee } from "../../../../models/Employee";

/**
 * Sorts employees by name in Spanish locale, with direction
 */
export const sortEmployeesByName = (employees: Employee[], direction: "asc" | "desc" = "asc"): Employee[] => {
  return [...employees].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`;
    const nameB = `${b.firstName} ${b.lastName}`;
    return direction === "asc"
      ? nameA.localeCompare(nameB, "es", { sensitivity: "base" })
      : nameB.localeCompare(nameA, "es", { sensitivity: "base" });
  });
};

/**
 * Paginates employees based on page and rows per page
 */
export const paginateEmployees = (
  employees: Employee[],
  page: number,
  rowsPerPage: number,
): Employee[] => {
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return employees.slice(startIndex, endIndex);
};

/**
 * Generates rows per page options including the current value
 */
export const generateRowsPerPageOptions = (rowsPerPage: number): number[] => {
  const defaultRowsPerPageOptions = [5, 10, 25, 50, 100];
  return Array.from(
    new Set([...defaultRowsPerPageOptions, rowsPerPage]),
  ).sort((a, b) => a - b);
}; 