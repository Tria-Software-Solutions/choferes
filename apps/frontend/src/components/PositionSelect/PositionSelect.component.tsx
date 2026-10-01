import React from "react";
import { Checkbox, ListItemText, MenuItem, SxProps, Theme } from "@mui/material";
import {
  EMPLOYEE_POSITIONS,
  EmployeeGender,
  getEmployeePositionLabel,
} from "@choferes/shared";
import PlaceholderSelect from "../PlaceholderSelect/PlaceholderSelect.component";

interface PositionSelectProps {
  value: string[];
  onChange: (positions: string[]) => void;
  gender?: EmployeeGender | string | null;
  label?: string;
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

// Un empleado puede tener varios puestos (cada uno con su rol de acceso): el
// selector es múltiple y muestra los nombres separados por coma. Siempre queda
// al menos uno, así que la lista nunca se vacía por accidente — el formulario
// valida el mínimo y muestra el aviso.
const PositionSelect: React.FC<PositionSelectProps> = ({
  value,
  onChange,
  gender,
  label,
  placeholder,
  icon,
  disabled,
  sx,
}) => {
  const labelOf = (position: string) =>
    getEmployeePositionLabel(position, (gender || null) as EmployeeGender | null) ?? position;

  return (
    <PlaceholderSelect<string[]>
      multiple
      label={label}
      placeholder={placeholder}
      icon={icon}
      disabled={disabled}
      value={value}
      formatValue={((position: string) => labelOf(position)) as unknown as (v: string[]) => React.ReactNode}
      onChange={(event) => {
        const next = event.target.value;
        const list = typeof next === "string" ? next.split(",") : next;
        // Se conserva el orden del catálogo para que el principal sea estable.
        onChange(EMPLOYEE_POSITIONS.filter((position) => list.includes(position)));
      }}
      sx={sx}
    >
      {EMPLOYEE_POSITIONS.map((position) => (
        <MenuItem key={position} value={position}>
          <Checkbox size="small" checked={value.includes(position)} sx={{ p: 0.5, mr: 1 }} />
          <ListItemText primary={labelOf(position)} />
        </MenuItem>
      ))}
    </PlaceholderSelect>
  );
};

export default PositionSelect;
