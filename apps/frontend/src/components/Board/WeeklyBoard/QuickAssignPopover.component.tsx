import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  type Theme,
} from "@mui/material";
import type { Employee } from "../../../models/Employee";
import type { Schedule } from "../../../models/Schedule";
import { getInitials, capitalizeFirstLetter, translateDayToAbrevSpanish } from "../../../utils/string";
import { getEmployeeColor } from "../../../utils/employeeColors";
import { formatHeaderDate } from "../../../utils/dates";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import { getScheduleHours } from "../../../utils/schedule";
import { SELECTOR_TABLE } from "../../../constants/constants";

interface QuickAssignPopoverProps {
  open: boolean;
  anchorPosition?: { top: number; left: number };
  onClose: () => void;
  view: "employee" | "schedule";
  day: string;
  date: string;
  schedules: Schedule[];
  employees: Employee[];
  fixedScheduleLabel?: string;
  isDark: boolean;
  theme: Theme;
  onAssign: (employeeId: number, scheduleLabel: string) => void;
}

/**
 * Popover that appears when the user clicks on a day column (individual view)
 * or a day cell (schedule view) to quickly assign an employee + schedule
 * without dragging.
 *
 * - view === "employee": two lists — select multiple employees + pick a schedule
 * - view === "schedule": one list — select multiple employees (schedule is fixed by the cell)
 */
const QuickAssignPopover: React.FC<QuickAssignPopoverProps> = ({
  open, anchorPosition, onClose, view, day, date, schedules, employees,
  fixedScheduleLabel, isDark, theme, onAssign,
}) => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState<string>("");

  const daySchedules = useMemo(
    () => schedules.filter((s) => s.days.includes(day.toLowerCase())),
    [schedules, day],
  );

  // Reset selection each time it opens
  useEffect(() => {
    if (open) {
      setSelectedEmployeeIds(new Set());
      setSelectedScheduleLabel("");
    }
  }, [open]);

  const confirmDisabled =
    selectedEmployeeIds.size === 0 ||
    (view === "employee" && selectedScheduleLabel === "");

  const handleToggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedEmployeeIds.size === 0) return;
    const scheduleLabel =
      view === "schedule" ? fixedScheduleLabel ?? "" : selectedScheduleLabel;
    if (!scheduleLabel) return;

    // Assign to all selected employees
    selectedEmployeeIds.forEach((empId) => {
      onAssign(empId, scheduleLabel);
    });
    onClose();
  };

  const employeeInitials = (emp: Employee) =>
    getInitials(emp.firstName, emp.lastName);

  const renderEmployeeItem = (emp: Employee) => {
    const isSelected = selectedEmployeeIds.has(emp.id);
    return (
      <ListItemButton
        key={emp.id}
        onClick={() => handleToggleEmployee(emp.id)}
        selected={isSelected}
        sx={{
          mx: 0.5, borderRadius: "8px", my: 0.2, px: 1.25, py: 0.7,
          "&.Mui-selected": {
            backgroundColor: isDark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.08)",
          },
          "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
        }}
      >
        <Box
          sx={{
            width: 24, height: 24, borderRadius: "50%", flexShrink: 0, mr: 1,
            backgroundColor: getEmployeeColor(emp.id),
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {employeeInitials(emp)}
          </Typography>
        </Box>
        <ListItemText
          primary={`${emp.firstName} ${emp.lastName?.[0]}.`}
          primaryTypographyProps={{
            fontSize: "0.78rem", fontWeight: isSelected ? 700 : 500,
          }}
        />
        {isSelected && (
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#818cf8" }}>✓</Typography>
        )}
      </ListItemButton>
    );
  };

  return (
    <Popover
      open={open}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            boxShadow: isDark ? "0 12px 44px rgba(0,0,0,0.45)" : "0 12px 44px rgba(0,0,0,0.14)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            width: 240,
            maxHeight: 360,
            overflow: "auto",
            mt: 0.5,
            p: 0.5,
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 1.25, py: 0.75, mb: 0.25,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      }}>
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.25 }}>
          {view === "employee" ? "Asignar en" : "Asignar a horario"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          {day ? (
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: theme.palette.text.primary }}>
              {capitalizeFirstLetter(translateDayToAbrevSpanish(day as EnglishDayOfWeek))} {formatHeaderDate(date)}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* Employee list with checkboxes */}
      <Typography sx={{
        px: 1.25, pt: 0.75, pb: 0.25, fontSize: "0.6rem", fontWeight: 600,
        color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        Empleados ({selectedEmployeeIds.size} seleccionados)
      </Typography>
      <List dense sx={{ py: 0, maxHeight: 150, overflow: "auto" }}>
        {employees.map(renderEmployeeItem)}
        {employees.length === 0 && (
          <Typography sx={{ px: 1.5, py: 1, fontSize: "0.7rem", color: "text.disabled" }}>
            No hay empleados disponibles
          </Typography>
        )}
      </List>

      {/* Schedule dropdown — only in employee view */}
      {view === "employee" && (
        <>
          <Typography sx={{
            px: 1.25, pt: 0.5, pb: 0.25, fontSize: "0.6rem", fontWeight: 600,
            color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em",
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            mt: 0.25,
          }}>
            Horario
          </Typography>
          <List dense sx={{ py: 0, maxHeight: 140, overflow: "auto" }}>
            {daySchedules.map((s) => (
              <ListItemButton
                key={s.id}
                onClick={() => setSelectedScheduleLabel(s.label)}
                selected={selectedScheduleLabel === s.label}
                sx={{
                  mx: 0.5, borderRadius: "8px", my: 0.2, px: 1.25, py: 0.6,
                  "&.Mui-selected": {
                    backgroundColor: isDark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.08)",
                  },
                  "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                }}
              >
                <Box sx={{
                  width: 6, height: 6, borderRadius: "50%", mr: 1.25, flexShrink: 0,
                  backgroundColor: "#818cf8",
                }} />
                <ListItemText
                  primary={s.label}
                  primaryTypographyProps={{
                    fontSize: "0.78rem",
                    fontWeight: selectedScheduleLabel === s.label ? 700 : 500,
                  }}
                />
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "#818cf8", ml: 1 }}>
                  {getScheduleHours(s, day)}h
                </Typography>
              </ListItemButton>
            ))}
            {daySchedules.length === 0 && (
              <Typography sx={{ px: 1.5, py: 1, fontSize: "0.7rem", color: "text.disabled" }}>
                {SELECTOR_TABLE.NO_AVAILABLE}
              </Typography>
            )}
          </List>
        </>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 0.75, p: 1, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
        <Box
          onClick={onClose}
          sx={{
            flex: 1, textAlign: "center", py: 0.7, borderRadius: "8px", cursor: "pointer",
            fontSize: "0.75rem", fontWeight: 600, color: "text.secondary",
            transition: "all 0.15s ease",
            "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },
          }}
        >
          Cancelar
        </Box>
        <Box
          onClick={handleConfirm}
          sx={{
            flex: 1, textAlign: "center", py: 0.7, borderRadius: "8px", cursor: "pointer",
            fontSize: "0.75rem", fontWeight: 700,
            backgroundColor: confirmDisabled
              ? (isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)")
              : "#6366f1",
            color: confirmDisabled ? (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)") : "#fff",
            transition: "all 0.15s ease",
            "&:hover": confirmDisabled ? {} : { backgroundColor: "#4f46e5" },
          }}
        >
          Asignar {selectedEmployeeIds.size > 1 ? `(${selectedEmployeeIds.size})` : ""}
        </Box>
      </Box>
    </Popover>
  );
};

export default QuickAssignPopover;