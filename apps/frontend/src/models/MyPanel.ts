/** Tipos del panel personal ("Mi Panel") — GET /me/overview. */
import type { Employee } from "./Employee";
import type { Vacation } from "./Vacation";
import type { VacationAccrual } from "./VacationAccrual";
import type { DisciplinaryAction } from "./DisciplinaryAction";
import type { EmployeeLicense } from "./EmployeeLicense";
import type { LicenseRequest } from "./LicenseRequest";
import type { Payment } from "./Payment";
import type { Task } from "./Task";

/** Un día con el Horario/Lugar que la persona tiene asignado (el nombre del horario es el lugar). */
export interface MyPanelWeekDay {
  /** YYYY-MM-DD. */
  date: string;
  /** Nombre del día en inglés (monday…sunday). */
  day: string;
  /** Horas del turno asignado ese día (0 si no hay asignación). */
  hours: number;
  scheduleId: number | null;
  /** Horario/Lugar asignado ("Avenida 123"…); null cuando no hay asignación. */
  scheduleLabel: string | null;
}

export interface MyPanelWeek {
  weekNumber: number;
  year: number;
  /** YYYY-MM-DD (lunes). */
  startDate: string;
  /** YYYY-MM-DD (domingo). */
  endDate: string;
  /** Horas asignadas en la semana (suma de los días). */
  totalHours: number;
  /** Lunes→domingo. */
  days: MyPanelWeekDay[];
}

export interface MyPanelWeeklyHistoryEntry {
  weekNumber: number;
  year: number;
  totalHours: number;
}

export interface MyPanelPeriodSummary {
  totalHours: number;
}

export interface MyPanelSummaries {
  weekly: (MyPanelPeriodSummary & { weekNumber: number; year: number }) | null;
  biweekly:
    | (MyPanelPeriodSummary & {
        biweekNumber: number;
        year: number;
        startDate: string;
        endDate: string;
      })
    | null;
  monthly: (MyPanelPeriodSummary & { month: number; year: number }) | null;
}

export interface MyPanelOverview {
  /** false = la cuenta no está vinculada a un empleado de Planilla. */
  linked: boolean;
  employee?: Employee;
  /** Semana en curso. */
  week?: MyPanelWeek;
  /** Semana siguiente (la programación suele publicarse con anticipación). */
  nextWeek?: MyPanelWeek;
  vacationAccrual?: VacationAccrual | null;
  vacations: Vacation[];
  disciplinaryActions: DisciplinaryAction[];
  licenses: EmployeeLicense[];
  /** Cambios de licencia pedidos por el empleado (en revisión o ya resueltos). */
  licenseRequests: LicenseRequest[];
  payments: Payment[];
  tasks: Task[];
  summaries: MyPanelSummaries;
  /** Histórico de las últimas semanas (ascendente) para la gráfica de tendencia. */
  history: { weekly: MyPanelWeeklyHistoryEntry[] };
}
