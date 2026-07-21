import {
  BRANDS_LIST,
  COLORS_LIST,
  //DAYS_LIST,
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

// Generar opciones de prefijos de parqueo programáticamente
const generatePrefixOptions = () => {
  const options: { value: string; label: string }[] = [{ value: "ATP", label: "ATP" }];
  
  // CE es un caso especial
  options.push({ value: "CE", label: "CE" });
  
  // Generar CR-CZ (C + R-Z)
  for (let charCode = 82; charCode <= 90; charCode++) {
    const prefix = `C${String.fromCharCode(charCode)}`;
    options.push({ value: prefix, label: prefix });
  }
  
  // Generar DA-EZ (D-E + A-Z)
  for (let first = 68; first <= 69; first++) {
    for (let second = 65; second <= 90; second++) {
      const prefix = `${String.fromCharCode(first)}${String.fromCharCode(second)}`;
      options.push({ value: prefix, label: prefix });
    }
  }
  
  return options;
};

export const PARKING_PREFIX_OPTIONS = generatePrefixOptions(); 