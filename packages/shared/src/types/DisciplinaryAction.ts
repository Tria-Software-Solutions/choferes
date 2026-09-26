// Llamadas de atención / amonestaciones a empleados, con adjuntos (documentos
// o imágenes) guardados como data URLs base64 en la base de datos.
export type DisciplinaryActionType =
  | "llamada_atencion"
  | "amonestacion_verbal"
  | "amonestacion_escrita"
  | "suspension"
  | "otra";

export const DISCIPLINARY_ACTION_TYPES: readonly DisciplinaryActionType[] = [
  "llamada_atencion",
  "amonestacion_verbal",
  "amonestacion_escrita",
  "suspension",
  "otra",
];

export const DISCIPLINARY_ACTION_TYPE_LABELS: Record<DisciplinaryActionType, string> = {
  llamada_atencion: "Llamada de atención",
  amonestacion_verbal: "Amonestación verbal",
  amonestacion_escrita: "Amonestación escrita",
  suspension: "Suspensión",
  otra: "Otra",
};

export type DisciplinarySeverity = "leve" | "grave" | "muy_grave";

export const DISCIPLINARY_SEVERITIES: readonly DisciplinarySeverity[] = [
  "leve",
  "grave",
  "muy_grave",
];

export const DISCIPLINARY_SEVERITY_LABELS: Record<DisciplinarySeverity, string> = {
  leve: "Leve",
  grave: "Grave",
  muy_grave: "Muy grave",
};

export interface DisciplinaryAttachment {
  name: string;
  mimeType: string;
  /** Tamaño en bytes. */
  size: number;
  /** data:<mime>;base64,<...> */
  dataUrl: string;
}

export interface DisciplinaryAction {
  id: number;
  employeeId: number;
  /** Fecha del hecho/registro, YYYY-MM-DD. */
  actionDate: string;
  type: DisciplinaryActionType;
  severity: DisciplinarySeverity;
  /** Motivo breve. */
  reason: string;
  description?: string | null;
  attachments?: DisciplinaryAttachment[] | null;
  /** Usuario que la registró. */
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
