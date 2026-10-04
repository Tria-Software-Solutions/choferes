import React from "react";
import { Box, Chip } from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";
import { getEmployeePositionsLabel } from "@choferes/shared";
import { Employee } from "../../../models/Employee";
import EmployeeAvatar from "../../../components/EmployeeAvatar/EmployeeAvatar.component";
import MobileListRow from "../../../components/MobileShell/MobileListRow.component";

interface EmployeeMobileListProps {
  employees: Employee[];
  /** Campos del perfil que faltan, para mostrar el aviso de "incompleto". */
  getMissingFields: (employee: Employee) => string[];
  onOpen: (employee: Employee) => void;
}

// Planilla en teléfonos y tablets: lista de filas en lugar de tabla con scroll
// horizontal. Cada fila abre el detalle del empleado.
const EmployeeMobileList: React.FC<EmployeeMobileListProps> = ({ employees, getMissingFields, onOpen }) => (
  <Box role="list">
    {employees.map((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.trim();
      const missing = getMissingFields(employee);
      const inactive = employee.isActive === false;
      return (
        <Box role="listitem" key={employee.id}>
          <MobileListRow
            ariaLabel={`Ver detalle de ${fullName}`}
            onClick={() => onOpen(employee)}
            leading={
              <EmployeeAvatar
                employee={{
                  id: employee.id,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  avatar: employee.avatar,
                }}
                size={44}
              />
            }
            title={fullName}
            subtitle={getEmployeePositionsLabel(employee, employee.gender) || "Sin puesto"}
            trailing={
              <>
                {missing.length > 0 && (
                  <Box
                    component="span"
                    aria-label={`Perfil incompleto: falta ${missing.join(" y ")}`}
                    sx={{ display: "flex", color: "warning.main" }}
                  >
                    <IconAlertTriangle size={18} stroke={2} />
                  </Box>
                )}
                {inactive && <Chip size="small" label="Inactivo" sx={{ height: 22, fontWeight: 600 }} />}
              </>
            }
          />
        </Box>
      );
    })}
  </Box>
);

export default EmployeeMobileList;
