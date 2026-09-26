export interface Permission {
  id: number;
  /** Stable authorization identity (e.g. "employees:view"). */
  code: string;
  /** UI grouping (e.g. "Empleados"). */
  module: string;
  /** Spanish display label (stored in the legacy `name` column). */
  name: string;
}
