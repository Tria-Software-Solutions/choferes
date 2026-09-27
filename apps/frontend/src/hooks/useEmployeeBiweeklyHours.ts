import { useEffect, useMemo, useState } from "react";
import {
  getEmployeesBiweeklyHours,
  type EmployeeBiweeklyHours,
} from "../services/employeeService";

type HoursState = {
  byEmployeeId: Map<number, EmployeeBiweeklyHours>;
  biweekNumber: number | null;
  year: number | null;
  isLoading: boolean;
};

/**
 * Horas y horas extra de la quincena actual para toda la tabla de Planilla.
 * El backend devuelve el período junto con los datos para que la columna pueda
 * mostrar a qué quincena corresponden los números.
 */
export const useEmployeeBiweeklyHours = (): HoursState => {
  const [state, setState] = useState<Omit<HoursState, "byEmployeeId">>({
    biweekNumber: null,
    year: null,
    isLoading: true,
  });
  const [byEmployeeId, setByEmployeeId] = useState<Map<number, EmployeeBiweeklyHours>>(
    new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    getEmployeesBiweeklyHours()
      .then((data) => {
        if (cancelled) return;
        setByEmployeeId(new Map(data.summaries.map((s) => [s.employeeId, s])));
        setState({ biweekNumber: data.biweekNumber, year: data.year, isLoading: false });
      })
      .catch(() => {
        // Sin horas registradas la tabla igual debe poder listar empleados.
        if (!cancelled) setState((prev) => ({ ...prev, isLoading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => ({ ...state, byEmployeeId }), [state, byEmployeeId]);
};
