import React, { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Check } from "lucide-react";
import { Permission } from "../../models/Permission";

// Shared toggle-chip panel for picking role permissions.
// Groups permissions by module (derived from their Spanish display name) and
// renders each permission as a chip with its display name that toggles on/off when clicked.

interface PermissionTogglePanelProps {
  permissions: Permission[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Maps a permission to the value stored in `selected` (defaults to permission.name) */
  getValue?: (permission: Permission) => string;
  maxHeight?: number;
}

const MODULE_ORDER = [
  "Empleados",
  "Roles",
  "Vehículos",
  "Horarios",
  "Usuarios",
  "Resúmenes",
  "Mensajería",
  "Courier",
  "Admin",
  "Otros",
];

const MODULE_RULES: { keyword: string; module: string }[] = [
  { keyword: "Courier", module: "Courier" },
  { keyword: "Mensajería", module: "Mensajería" },
  { keyword: "Horario", module: "Horarios" },
  { keyword: "Vehículo", module: "Vehículos" },
  { keyword: "Resumen", module: "Resúmenes" },
  { keyword: "Rol", module: "Roles" },
  { keyword: "Empleado", module: "Empleados" },
  { keyword: "Usuario", module: "Usuarios" },
  { keyword: "Admin", module: "Admin" },
];

const moduleOf = (name: string) => {
  const match = MODULE_RULES.find(({ keyword }) => name.includes(keyword));
  return match ? match.module : "Otros";
};

const PermissionTogglePanel: React.FC<PermissionTogglePanelProps> = ({
  permissions,
  selected,
  onToggle,
  getValue = (permission) => permission.name,
  maxHeight = 220,
}) => {
  const theme = useTheme();

  const groupedPermissions = useMemo(() => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach((permission) => {
      const module = moduleOf(permission.name);
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(permission);
    });
    return grouped;
  }, [permissions]);

  const modules = Object.keys(groupedPermissions).sort(
    (a, b) => MODULE_ORDER.indexOf(a) - MODULE_ORDER.indexOf(b),
  );

  return (
    <Box
      sx={{
        maxHeight,
        overflowY: "auto",
        borderRadius: "12px",
        p: 1.25,
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.06)"
        }`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.02)"
            : "rgba(0,0,0,0.015)",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.15)",
          borderRadius: "3px",
        },
      }}
    >
      {modules.map((module) => (
        <Box key={module} sx={{ mb: 1.5, "&:last-of-type": { mb: 0 } }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: theme.palette.text.secondary,
              fontSize: "0.62rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mb: 0.75,
            }}
          >
            {module}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {groupedPermissions[module].map((permission) => {
              const value = getValue(permission);
              const isSelected = selected.includes(value);
              return (
                <Box
                  key={permission.id}
                  onClick={() => onToggle(value)}
                  role="button"
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(value);
                    }
                  }}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    userSelect: "none",
                    borderRadius: "8px",
                    px: 1,
                    py: 0.5,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: isSelected
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                    backgroundColor: isSelected
                      ? theme.palette.primary.main
                      : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: isSelected
                        ? "none"
                        : "0 2px 8px rgba(0,0,0,0.1)",
                    },
                    "&:active": { transform: "scale(0.96)" },
                  }}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                  {permission.name}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default PermissionTogglePanel;
