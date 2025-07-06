
import {
  BRANDS_LIST,
  COLORS_LIST,
  DAYS_LIST,
} from "../../../../constants/constants";

export type ColumnConfigType = {
  type:
    | "text"
    | "masked"
    | "date"
    | "select"
    | "select multiple"
    | "autocomplete"
    | "autocomplete multiple";
  options?: { value: string; label: string }[];
  hidden?: boolean;
  size?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
};

export const createColumnConfig = (
  roles: Array<{ name: string }>,
  permissions: Array<{ name: string }>
): Record<string, ColumnConfigType> => ({
  licensePlate: {
    type: "masked",
    size: { xs: 4, sm: 3, md: 1.5, lg: 0.3 },
  },
  parkingLot: {
    type: "masked",
    size: { xs: 4, sm: 3, md: 1.5, lg: 0.8 },
  },
  ticket: {
    type: "text",
    size: { xs: 4, sm: 3, md: 1.5, lg: 0.3 },
  },
  brand: {
    type: "autocomplete",
    options: BRANDS_LIST,
    size: { xs: 8, sm: 6, md: 3, lg: 5 },
  },
  color: {
    type: "autocomplete",
    options: COLORS_LIST,
    size: { xs: 8, sm: 6, md: 3, lg: 5 },
  },
  notes: {
    type: "text",
    size: { xs: 6, sm: 4, md: 2, lg: 2 },
  },
  parkingDate: {
    type: "date",
    hidden: true,
    size: { xs: 6, sm: 4, md: 2, lg: 2 },
  },

  firstName: {
    type: "text",
    size: { xs: 6, sm: 6, md: 6, lg: 6 },
  },
  lastName: {
    type: "text",
    size: { xs: 6, sm: 6, md: 6, lg: 6 },
  },

  label: {
    type: "text",
    size: { xs: 6, sm: 6, md: 3, lg: 3 },
  },
  days: {
    type: "select multiple",
    options: DAYS_LIST,
    size: { xs: 6, sm: 6, md: 3, lg: 3 },
  },
  hours: {
    type: "text",
    size: { xs: 6, sm: 6, md: 3, lg: 2 },
  },
  specialSchedule: {
    type: "text",
    size: { xs: 6, sm: 6, md: 3, lg: 4 },
  },

  email: {
    type: "text",
    size: { xs: 12, sm: 12, md: 2, lg: 2 },
  },
  username: {
    type: "text",
    size: { xs: 6, sm: 6, md: 2, lg: 2 },
  },
  password: {
    type: "text",
    size: { xs: 6, sm: 6, md: 2, lg: 2 },
  },
  roleName: {
    type: "select",
    options: roles.map((role) => ({ value: role.name, label: role.name })),
    size: { xs: 6, sm: 6, md: 2, lg: 2 },
  },

  name: {
    type: "text",
    size: { xs: 12, sm: 12, md: 4, lg: 3 },
  },
  permissionNames: {
    type: "autocomplete multiple",
    options: permissions.map((permission) => ({
      value: permission.name,
      label: permission.name,
    })),
    size: { xs: 12, sm: 12, md: 8, lg: 9 },
  },

  updatedAt: { type: "date", hidden: true },
  route: {
    type: "select",
    options: [
      { value: "GAM", label: "GAM" },
      { value: "GAM Express", label: "GAM Express" },
      { value: "Rural", label: "Rural" },
    ],
    size: { xs: 6, sm: 6, md: 3, lg: 3 },
  },
  status: {
    type: "select",
    options: [
      { value: "Despachado", label: "Despachado" },
      { value: "En Tránsito", label: "En Tránsito" },
      { value: "Entregado", label: "Entregado" },
    ],
    size: { xs: 6, sm: 6, md: 3, lg: 3 },
  },
  driver: {
    type: "text",
    size: { xs: 6, sm: 6, md: 3, lg: 3 },
  },
  distance: {
    type: "text",
    size: { xs: 6, sm: 6, md: 2, lg: 2 },
  },
  trackingNumber: {
    type: "text",
    size: { xs: 6, sm: 6, md: 3, lg: 3 },
  },
  createdAt: {
    type: "date",
    size: { xs: 6, sm: 6, md: 3, lg: 3 },
  },
});

export const getColumnSize = (column: string, config: Record<string, ColumnConfigType>) => {
  return config[column]?.size;
};

export const shouldShowColumn = (column: string, config: Record<string, ColumnConfigType>) => {
  return !config[column]?.hidden;
};

export const PARKING_PREFIX_OPTIONS = [
  { value: "ATP", label: "ATP" },
  { value: "CE", label: "CE" },
  { value: "CR", label: "CR" },
  { value: "CT", label: "CT" },
  { value: "CV", label: "CV" },
  { value: "CX", label: "CX" },
  { value: "CY", label: "CY" },
  { value: "CZ", label: "CZ" },
  { value: "DA", label: "DA" },
  { value: "DB", label: "DB" },
  { value: "DC", label: "DC" },
  { value: "DD", label: "DD" },
  { value: "DE", label: "DE" },
  { value: "DF", label: "DF" },
  { value: "DG", label: "DG" },
  { value: "DH", label: "DH" },
  { value: "DI", label: "DI" },
  { value: "DJ", label: "DJ" },
  { value: "DK", label: "DK" },
  { value: "DL", label: "DL" },
  { value: "DM", label: "DM" },
  { value: "DN", label: "DN" },
  { value: "DO", label: "DO" },
  { value: "DP", label: "DP" },
  { value: "DQ", label: "DQ" },
  { value: "DR", label: "DR" },
  { value: "DS", label: "DS" },
  { value: "DT", label: "DT" },
  { value: "DU", label: "DU" },
  { value: "DV", label: "DV" },
  { value: "DW", label: "DW" },
  { value: "DX", label: "DX" },
  { value: "DY", label: "DY" },
  { value: "DZ", label: "DZ" },
  { value: "EA", label: "EA" },
  { value: "EB", label: "EB" },
  { value: "EC", label: "EC" },
  { value: "ED", label: "ED" },
  { value: "EE", label: "EE" },
  { value: "EF", label: "EF" },
  { value: "EG", label: "EG" },
  { value: "EH", label: "EH" },
  { value: "EI", label: "EI" },
  { value: "EJ", label: "EJ" },
  { value: "EK", label: "EK" },
  { value: "EL", label: "EL" },
  { value: "EM", label: "EM" },
  { value: "EN", label: "EN" },
  { value: "EO", label: "EO" },
  { value: "EP", label: "EP" },
  { value: "EQ", label: "EQ" },
  { value: "ER", label: "ER" },
  { value: "ES", label: "ES" },
  { value: "ET", label: "ET" },
  { value: "EU", label: "EU" },
  { value: "EV", label: "EV" },
  { value: "EW", label: "EW" },
  { value: "EX", label: "EX" },
  { value: "EY", label: "EY" },
  { value: "EZ", label: "EZ" },
]; 