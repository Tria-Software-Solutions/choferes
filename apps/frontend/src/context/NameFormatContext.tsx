import React, { createContext, useContext } from "react";

// Preferencia de nombre a mostrar (Roles y, a futuro, cualquier lista de
// empleados). Se guarda en localStorage para recordarla entre sesiones y se
// comparte por contexto para no tener que pasar la prop por todo el árbol.

export type EmployeeNameFormat = "full" | "preferred";

export const EMPLOYEE_NAME_FORMAT_KEY = "employeeNameFormat";

export const getStoredNameFormat = (): EmployeeNameFormat => {
  try {
    return localStorage.getItem(EMPLOYEE_NAME_FORMAT_KEY) === "preferred"
      ? "preferred"
      : "full";
  } catch {
    return "full";
  }
};

export const setStoredNameFormat = (format: EmployeeNameFormat): void => {
  try {
    localStorage.setItem(EMPLOYEE_NAME_FORMAT_KEY, format);
  } catch {
    /* almacenamiento no disponible: se mantiene en memoria */
  }
};

interface NameHolder {
  firstName?: string | null;
  lastName?: string | null;
  preferredName?: string | null;
}

/** "Carlos Mora" o su nombre preferido ("Carlitos") según la preferencia. */
export const formatEmployeeName = (employee: NameHolder | null | undefined, format: EmployeeNameFormat): string => {
  if (!employee) return "";
  const preferred = employee.preferredName?.trim();
  if (format === "preferred" && preferred) return preferred;
  return `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
};

const NameFormatContext = createContext<EmployeeNameFormat>("full");

export const NameFormatProvider: React.FC<{
  value: EmployeeNameFormat;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <NameFormatContext.Provider value={value}>{children}</NameFormatContext.Provider>
);

export const useEmployeeNameFormat = (): EmployeeNameFormat => useContext(NameFormatContext);

/** Nombre de un empleado ya formateado según la preferencia activa. */
export const EmployeeName: React.FC<{ employee: NameHolder | null | undefined }> = ({
  employee,
}) => <>{formatEmployeeName(employee, useEmployeeNameFormat())}</>;
