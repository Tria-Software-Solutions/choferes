import React from "react";
import { Box, ButtonBase, Typography, useTheme } from "@mui/material";
import { IconCalendarX, IconMail, IconPhone } from "@tabler/icons-react";
import EmployeeAvatar from "../../../components/EmployeeAvatar/EmployeeAvatar.component";
import { pressable } from "../../../components/MobileShell/mobileShell.constants";
import type { Employee } from "../../../models/Employee";

interface EmployeeMobileHeaderProps {
  employee: Employee;
  position?: string | null;
  /** Muestra la acción de finalizar entre las acciones rápidas. */
  onTerminate?: () => void;
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  tone?: "accent" | "warning";
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, href, onClick, tone = "accent" }) => {
  const { colors } = useTheme().tokens;
  const fg = tone === "warning" ? colors.warningDark : colors.accent;
  const bg = tone === "warning" ? colors.warningSoft : colors.accentSoft;
  return (
    <ButtonBase
      component={href ? "a" : "button"}
      href={href}
      onClick={onClick}
      aria-label={label}
      sx={{ flexDirection: "column", gap: 0.5, width: 72, borderRadius: "14px", py: 0.5, ...pressable }}
    >
      <Box sx={{ width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: "14px", color: fg, backgroundColor: bg }}>
        {icon}
      </Box>
      <Typography component="span" sx={{ fontSize: "0.6875rem", fontWeight: 600, color: colors.textMuted }}>
        {label}
      </Typography>
    </ButtonBase>
  );
};

// Encabezado del expediente en teléfonos: tarjeta de contacto con avatar,
// nombre, puesto, estado y acciones rápidas (llamar, correo, finalizar).
const EmployeeMobileHeader: React.FC<EmployeeMobileHeaderProps> = ({ employee, position, onTerminate }) => {
  const { colors } = useTheme().tokens;
  const inactive = employee.isActive === false;
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();

  return (
    <Box sx={{ px: 2, pt: 2.5, pb: 1.5, textAlign: "center", backgroundColor: colors.surface }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <EmployeeAvatar employee={employee} size={84} sx={{ border: `3px solid ${colors.surface}`, boxShadow: `0 0 0 1px ${colors.border}` }} />
      </Box>

      <Typography component="h2" sx={{ mt: 1.25, fontSize: "1.3125rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
        {fullName}
      </Typography>
      {employee.preferredName && (
        <Typography sx={{ fontSize: "0.8125rem", color: colors.textMuted }}>“{employee.preferredName}”</Typography>
      )}
      <Box sx={{ mt: 0.75, display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
        {position && (
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: colors.textMuted }}>{position}</Typography>
        )}
        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.15,
            borderRadius: "999px",
            fontSize: "0.6875rem",
            fontWeight: 700,
            color: inactive ? colors.textMuted : colors.successDark,
            backgroundColor: inactive ? colors.hover : colors.successSoft,
          }}
        >
          {inactive ? "Inactivo" : "Activo"}
        </Box>
      </Box>

      <Box sx={{ mt: 1.75, display: "flex", justifyContent: "center", gap: 1 }}>
        {employee.primaryPhone && (
          <QuickAction icon={<IconPhone size={22} stroke={1.75} />} label="Llamar" href={`tel:${employee.primaryPhone}`} />
        )}
        {employee.email && (
          <QuickAction icon={<IconMail size={22} stroke={1.75} />} label="Correo" href={`mailto:${employee.email}`} />
        )}
        {onTerminate && (
          <QuickAction icon={<IconCalendarX size={22} stroke={1.75} />} label="Finalizar" onClick={onTerminate} tone="warning" />
        )}
      </Box>
    </Box>
  );
};

export default EmployeeMobileHeader;
