import React, { useMemo, useState, useCallback, memo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  TextField,
  Dialog,
  Button,
  type Theme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import type { Employee } from "../../../models/Employee";
import type { Schedule } from "../../../models/Schedule";
import type { HoursWorked } from "../../../models/HoursWorked";
import type { WeeklySummary } from "../../../models/WeeklySummary";
import type { BiweeklySummary } from "../../../models/BiweeklySummary";
import type { MonthlySummary } from "../../../models/MonthlySummary";
import {
  formatHeaderDate,
  getCurrentWeekDates,
  getInvolvedPeriods,
} from "../../../utils/dates";
import { translateDayToAbrevSpanish, capitalizeFirstLetter, getInitials } from "../../../utils/string";
import { getEmployeeColor } from "../../../utils/employeeColors";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import { PERMISSIONS, SELECTOR_TABLE } from "../../../constants/constants";
import { getScheduleHours } from "../../../utils/schedule";
import {
  getScheduleCellData,
  isToday,
} from "../../Table/SelectorTable/helpers/scheduleCell";
import {
  calculateTotalHours,
  calculateOvertime,
} from "../../Table/SelectorTable/helpers/hoursCalculation";

// ─── Palette ───
const SCHEDULE_COLORS = [
  { bg: "rgba(99, 102, 241, 0.08)", text: "#6366f1", border: "rgba(99, 102, 241, 0.14)" },
  { bg: "rgba(79, 70, 229, 0.06)", text: "#6366f1", border: "rgba(79, 70, 229, 0.10)" },
  { bg: "rgba(99, 102, 241, 0.04)", text: "#818cf8", border: "rgba(99, 102, 241, 0.08)" },
  { bg: "rgba(99, 102, 241, 0.03)", text: "#6366f1", border: "rgba(99, 102, 241, 0.06)" },
];

interface ColorScheme { bg: string; text: string; border: string; }

const getScheduleColor = (_label: string, index: number): ColorScheme =>
  SCHEDULE_COLORS[index % SCHEDULE_COLORS.length];

type PeriodType = "weekly" | "biweekly" | "monthly";

const PERIOD_OPTIONS: { value: PeriodType; label: string; icon: React.ReactNode }[] = [
  { value: "weekly", label: "Semanal", icon: <CalendarTodayIcon sx={{ fontSize: 15 }} /> },
  { value: "biweekly", label: "Quincenal", icon: <DateRangeIcon sx={{ fontSize: 15 }} /> },
  { value: "monthly", label: "Mensual", icon: <CalendarMonthIcon sx={{ fontSize: 15 }} /> },
];

// ─── Drag data types ───
interface DragCardData {
  sourceType: 'card';
  employee: Employee;
  scheduleLabel: string;
  scheduleColor: ColorScheme;
  hours: number;
  overtime: number;
  periodTotal: number;
  periodOvertime: number;
  isUnassigned: boolean;
  sourceDay: string;
  sourceDate: string;
}

interface DragTotalsData {
  sourceType: 'totals';
  employee: Employee;
}

type DragItemData = DragCardData | DragTotalsData;

interface DropColumnData {
  viewType?: 'employee' | 'schedule' | 'totals';
  day: string;
  date: string;
  scheduleLabel?: string;
}

// ─── Props ───
interface WeeklyBoardProps {
  filteredEmployees: Employee[];
  schedules: Schedule[];
  hoursWorked: HoursWorked[];
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
  weekOffset: number;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  handleChange: (value: string, employeeId: number, date: Date) => void;
  handleAdjustTime: (employeeId: number, condition: "add" | "subtract", timeAdjustment: number) => void;
  recalculateEmployeeWeeklySummary?: (
    employeeId: number,
    date: Date,
    newHoursWorkedEntry?: { employeeId: number; date: string; scheduleId: number }
  ) => Promise<void>;
  permissions?: string[];
  viewMode: "employee" | "schedule";
  setViewMode: React.Dispatch<React.SetStateAction<"employee" | "schedule">>;
  onInfoClick?: (employee: Employee) => void;
  onAdjustClick?: (employee: Employee) => void;
}

// ─── Employee Card ───
interface EmployeeCardProps {
  employee: Employee;
  scheduleLabel: string;
  scheduleColor: ColorScheme;
  hours: number;
  overtime: number;
  isUnassigned: boolean;
  periodTotal: number;
  periodOvertime: number;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  onInfo?: (e: React.MouseEvent) => void;
  onAdjust?: (e: React.MouseEvent) => void;
  theme: Theme;
  isDragging?: boolean;
}

const EmployeeCard = memo(function EmployeeCard({
  employee, scheduleLabel, scheduleColor, hours, overtime, isUnassigned,
  periodTotal,
  onClick, onInfo, onAdjust, theme, isDragging,
}: EmployeeCardProps) {
  const initials = getInitials(employee.firstName, employee.lastName);
  const isDark = theme.palette.mode === "dark";
  const empColor = getEmployeeColor(employee.id);

  if (isUnassigned) {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: "flex", alignItems: "center", gap: 0.75, px: 1, py: 0.85,
          borderRadius: "10px", cursor: "grab",
          backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
          border: `1px dashed ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"}`,
          transition: "all 0.2s ease", userSelect: "none",
          opacity: isDragging ? 0.3 : 1,
          "&:hover": {
            borderColor: "#818cf8",
            backgroundColor: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)",
            transform: "translateY(-1px)",
            boxShadow: "0 2px 8px rgba(99,102,241,0.12)",
          },
          "&:active": { transform: "scale(0.98)", cursor: "grabbing" },
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 13, color: theme.palette.text.disabled, opacity: 0.35, flexShrink: 0 }} />          <Box sx={{
          width: 24, height: 24, borderRadius: "50%",
          backgroundColor: empColor,
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.6rem", fontWeight: 700, flexShrink: 0,
        }}>
          {initials}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: "0.72rem", fontWeight: 600, color: theme.palette.text.primary,
            lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {employee.firstName} {employee.lastName?.[0]}.
          </Typography>
          <Typography sx={{
            fontSize: "0.58rem", fontWeight: 500, color: theme.palette.text.disabled,
            lineHeight: 1.3, fontStyle: "italic",
          }}>
            {scheduleLabel}
          </Typography>
        </Box>
        <Box sx={{
          width: 18, height: 18, borderRadius: "6px",
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          color: theme.palette.text.disabled,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", fontWeight: 600, flexShrink: 0,
          transition: "all 0.15s ease",
        }}>
          +
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.85,
        borderRadius: "10px",
        backgroundColor: scheduleColor.bg,
        border: `1px solid ${scheduleColor.border}`,
        cursor: "grab",
        transition: "all 0.2s ease",
        userSelect: "none",
        opacity: isDragging ? 0.3 : 1,
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: `0 4px 12px ${scheduleColor.border}`,
          "& .card-actions": { opacity: 1 },
        },
        "&:active": { transform: "scale(0.98)", cursor: "grabbing" },
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "20%",
          bottom: "20%",
          width: 2.5,
          borderRadius: "0 2px 2px 0",
          backgroundColor: scheduleColor.text,
          opacity: 0.5,
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, color: scheduleColor.text, opacity: 0.3, ml: 0.25 }}>
        <DragIndicatorIcon sx={{ fontSize: 13 }} />
      </Box>

      {/* Initials */}
      <Box sx={{
        width: 24, height: 24, borderRadius: "50%",
        backgroundColor: empColor,
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.6rem", fontWeight: 700, flexShrink: 0,
      }}>
        {initials}
      </Box>

      {/* Name + label */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: "0.72rem", fontWeight: 600, color: theme.palette.text.primary,
          lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {employee.firstName}
        </Typography>
        <Typography sx={{
          fontSize: "0.58rem", fontWeight: 500, color: scheduleColor.text,
          lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {scheduleLabel}
        </Typography>
      </Box>

      {/* Info/adjust buttons (hover only) */}
      <Box className="card-actions" sx={{
        display: "flex", alignItems: "center", gap: 0.15, opacity: 0,
        transition: "opacity 0.15s ease",
        flexShrink: 0,
      }}>
        {onInfo && (
          <Box component="span" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onInfo(e); }}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: "5px", color: "text.secondary",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.06)", color: "primary.main" },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 11 }} />
          </Box>
        )}
        {onAdjust && (
          <Box component="span" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAdjust(e); }}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: "5px",
              color: overtime > 0 ? "warning.main" : "text.disabled",
              "&:hover": { backgroundColor: "rgba(237,108,2,0.1)" },
            }}
          >
            <MoreTimeIcon sx={{ fontSize: 11 }} />
          </Box>
        )}
      </Box>

      {/* Daily hours */}
      <Typography sx={{
        fontSize: "0.68rem", fontWeight: 700, color: scheduleColor.text, flexShrink: 0, opacity: 0.8, ml: 0.25,
      }}>
        {hours}h
      </Typography>
    </Box>
  );
});

// ─── Drag overlay card ───
interface DragOverlayCardProps {
  employee: Employee;
  scheduleLabel: string;
  scheduleColor: ColorScheme;
  hours: number;
  periodTotal: number;
  periodOvertime: number;
  isUnassigned: boolean;
  isDark: boolean;
}

const DragOverlayCard = memo(function DragOverlayCard({
  employee, scheduleLabel, scheduleColor, hours, periodTotal, periodOvertime, isUnassigned, isDark,
}: DragOverlayCardProps) {
  const initials = getInitials(employee.firstName, employee.lastName);
  const empColor = getEmployeeColor(employee.id);

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 1.25,
      borderRadius: "12px",
      backgroundColor: isUnassigned
        ? (isDark ? "rgba(30,30,40,0.95)" : "rgba(255,255,255,0.95)" )
        : scheduleColor.bg.replace("0.08", "0.85"),
      border: `2px solid ${isUnassigned ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)") : scheduleColor.text}`,
      boxShadow: isDark
        ? "0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)"
        : "0 12px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.9)",
      transform: "rotate(-3deg) scale(1.08)",
      backdropFilter: "blur(8px)",
      width: 180,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Color accent line */}
      <Box sx={{
        position: "absolute", left: 0, top: "15%", bottom: "15%", width: 3,
        borderRadius: "0 3px 3px 0",
        backgroundColor: isUnassigned ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)") : scheduleColor.text,
      }} />

      <Box sx={{
        width: 30, height: 30, borderRadius: "50%",
        backgroundColor: empColor,
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
      }}>
        {initials}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: "0.8rem", fontWeight: 700,
          color: isUnassigned
            ? (isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)")
            : scheduleColor.text,
          lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {employee.firstName}
        </Typography>
        <Typography sx={{
          fontSize: "0.6rem", fontWeight: 500,
          color: isUnassigned ? "rgba(0,0,0,0.3)" : scheduleColor.text,
          lineHeight: 1.3, opacity: isUnassigned ? 0.5 : 0.8,
        }}>
          {isUnassigned ? "Sin asignar" : scheduleLabel}
        </Typography>
      </Box>

      {!isUnassigned && (
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: scheduleColor.text, lineHeight: 1 }}>
            {hours}h
          </Typography>
          <Typography sx={{ fontSize: "0.5rem", fontWeight: 600, color: scheduleColor.text, opacity: 0.5, lineHeight: 1.2 }}>
            T: {periodTotal}h
          </Typography>
          {periodOvertime > 0 && (
            <Typography sx={{ fontSize: "0.5rem", fontWeight: 700, color: "#34d399", lineHeight: 1.2 }}>
              +{periodOvertime}h
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
});

// ─── Draggable card wrapper ───
interface DraggableCardWrapperProps {
  employee: Employee;
  scheduleLabel: string;
  scheduleColor: ColorScheme;
  hours: number;
  overtime: number;
  isUnassigned: boolean;
  periodTotal: number;
  periodOvertime: number;
  sourceDay: string;
  sourceDate: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  onInfo?: (e: React.MouseEvent) => void;
  onAdjust?: (e: React.MouseEvent) => void;
  theme: Theme;
}

function DraggableCardWrapper({
  employee, scheduleLabel, scheduleColor, hours, overtime, isUnassigned,
  periodTotal, periodOvertime, sourceDay, sourceDate, onClick, onInfo, onAdjust, theme,
}: DraggableCardWrapperProps) {
  const dragId: UniqueIdentifier = `emp-${employee.id}-${sourceDay}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      sourceType: 'card' as const,
      employee, scheduleLabel, scheduleColor, hours, overtime, periodTotal, periodOvertime, isUnassigned, sourceDay, sourceDate,
    } satisfies DragCardData,
  });

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        opacity: isDragging ? 0.15 : 1,
        transform: isDragging ? "scale(0.93)" : "none",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        touchAction: "none",
      }}
    >
      <EmployeeCard
        employee={employee} scheduleLabel={scheduleLabel} scheduleColor={scheduleColor}
        hours={hours} overtime={overtime} isUnassigned={isUnassigned}
        periodTotal={periodTotal} periodOvertime={periodOvertime}
        onClick={onClick} onInfo={onInfo} onAdjust={onAdjust} theme={theme} isDragging={isDragging}
      />
    </Box>
  );
}

// ─── Draggable totals row ───
interface DraggableTotalsRowProps {
  employee: Employee;
  hours: number;
  overtime: number;
  empColor: string;
  isDark: boolean;
  onInfoClick?: (employee: Employee) => void;
  onAdjustClick?: (employee: Employee) => void;
  theme: Theme;
}

function DraggableTotalsRow({
  employee, hours, overtime, empColor, isDark, onInfoClick, onAdjustClick, theme,
}: DraggableTotalsRowProps) {
  const initials = getInitials(employee.firstName, employee.lastName);
  const dragId: UniqueIdentifier = `totals-${employee.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      sourceType: 'totals' as const,
      employee,
    } satisfies DragTotalsData,
  });

  const accentColor = isDark ? "#a78bfa" : "#7c3aed";

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        display: "flex", alignItems: "center", gap: 0.75,
        px: 1.25, py: 1.35, borderRadius: "12px",
        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
        cursor: "grab",
        transition: "all 0.2s ease",
        userSelect: "none",
        opacity: isDragging ? 0.2 : 1,
        position: "relative",
        touchAction: "none",
        "&:hover": {
          borderColor: accentColor,
          backgroundColor: isDark ? "rgba(139,92,246,0.06)" : "rgba(139,92,246,0.04)",
          transform: "translateY(-1px)",
          boxShadow: `0 3px 10px ${isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)"}`,
        },
        "&:active": { transform: "scale(0.97)", cursor: "grabbing" },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, color: theme.palette.text.disabled, opacity: 0.4 }}>
        <DragIndicatorIcon sx={{ fontSize: 15 }} />
      </Box>

      {/* Initials */}
      <Box sx={{
        width: 28, height: 28, borderRadius: "50%",
        backgroundColor: empColor, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 2px 6px ${empColor}50`,
      }}>
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
          {initials}
        </Typography>
      </Box>

      {/* Name */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: "0.72rem", fontWeight: 600, color: theme.palette.text.primary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3,
        }}>
          {employee.firstName} {employee.lastName?.[0]}
        </Typography>
      </Box>

      {/* Hours + overtime + actions */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.2, flexShrink: 0 }}>
        {hours > 0 ? (
          <Typography sx={{
            fontSize: "0.85rem", fontWeight: 800,
            color: accentColor,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1.2,
          }}>
            {hours}h
          </Typography>
        ) : (
          <Typography sx={{
            fontSize: "0.6rem", fontWeight: 500, color: theme.palette.text.disabled,
            lineHeight: 1.2,
          }}>
            Sin horas
          </Typography>
        )}
        {overtime > 0 && (
          <Typography sx={{
            fontSize: "0.6rem", fontWeight: 700, color: "#34d399",
            lineHeight: 1.2,
          }}>
            +{overtime}h extra
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.3 }}>
          {onInfoClick && (
            <Box
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onInfoClick(employee); }}
              title="Ver información"
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 24, height: 24, borderRadius: "6px",
                color: "text.secondary",
                transition: "all 0.15s ease",
                "&:hover": { backgroundColor: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.06)", color: accentColor },
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 13 }} />
            </Box>
          )}
          {onAdjustClick && (
            <Box
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAdjustClick(employee); }}
              title="Ajustar horas manualmente"
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 24, height: 24, borderRadius: "6px",
                color: overtime > 0 ? "warning.main" : "text.secondary",
                backgroundColor: overtime > 0 ? (isDark ? "rgba(237,108,2,0.1)" : "rgba(237,108,2,0.06)") : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { backgroundColor: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.06)", color: accentColor },
              }}
            >
              <MoreTimeIcon sx={{ fontSize: 14 }} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Draggable swimlane card ───
interface DraggableSwimlaneCardProps {
  employee: Employee;
  schedule: Schedule;
  day: string;
  date: string;
  scheduleColor: ColorScheme;
  hours: number;
  overtime: number;
  periodTotal: number;
  periodOvertime: number;
  isSelected: boolean;
  toggleSelection: (employeeId: number, ctrlKey: boolean) => void;
  handleCardClick: (employee: Employee, day: string, date: string) => (e: React.MouseEvent<HTMLElement>) => void;
  canEdit: boolean | undefined;
  onInfo?: (e: React.MouseEvent) => void;
  onAdjust?: (e: React.MouseEvent) => void;
  theme: Theme;
}

function DraggableSwimlaneCard({
  employee, schedule, day, date, scheduleColor,
  hours, overtime, periodTotal, periodOvertime,
  isSelected, toggleSelection, handleCardClick, canEdit,
  onInfo, onAdjust, theme,
}: DraggableSwimlaneCardProps) {
  const dragId: UniqueIdentifier = `swim-${employee.id}-${schedule.id}-${day}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      sourceType: 'card' as const,
      employee,
      scheduleLabel: schedule.label,
      scheduleColor,
      hours,
      overtime,
      periodTotal,
      periodOvertime,
      isUnassigned: false,
      sourceDay: day,
      sourceDate: date,
    } satisfies DragCardData,
  });

  const initials = getInitials(employee.firstName, employee.lastName);
  const empColor = getEmployeeColor(employee.id);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.stopPropagation();
      toggleSelection(employee.id, true);
    } else if (canEdit && handleCardClick) {
      handleCardClick(employee, day, date)(e);
    }
  };

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      sx={{
        display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.85,
        borderRadius: "10px",
        backgroundColor: scheduleColor.bg,
        border: `1px solid ${scheduleColor.border}`,
        cursor: canEdit ? "grab" : "default",
        transition: "all 0.2s ease",
        userSelect: "none",
        opacity: isDragging ? 0.3 : 1,
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
        outline: isSelected ? `2px solid ${scheduleColor.text}` : "none",
        outlineOffset: 1,
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: `0 4px 12px ${scheduleColor.border}`,
          "& .card-actions": { opacity: 1 },
        },
        "&:active": { transform: "scale(0.98)", cursor: "grabbing" },
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "20%",
          bottom: "20%",
          width: 2.5,
          borderRadius: "0 2px 2px 0",
          backgroundColor: scheduleColor.text,
          opacity: 0.5,
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, color: scheduleColor.text, opacity: 0.3, ml: 0.25 }}>
        <DragIndicatorIcon sx={{ fontSize: 13 }} />
      </Box>

      {/* Initials */}
      <Box sx={{
        width: 24, height: 24, borderRadius: "50%",
        backgroundColor: empColor,
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.6rem", fontWeight: 700, flexShrink: 0,
      }}>
        {initials}
      </Box>

      {/* Name + label */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: "0.72rem", fontWeight: 600, color: theme.palette.text.primary,
          lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {employee.firstName}
        </Typography>
      </Box>

      {/* Info/adjust buttons (hover only) */}
      <Box className="card-actions" sx={{
        display: "flex", alignItems: "center", gap: 0.15, opacity: 0,
        transition: "opacity 0.15s ease",
        flexShrink: 0,
      }}>
        {onInfo && (
          <Box component="span" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onInfo(e); }}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: "5px", color: "text.secondary",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.06)", color: "primary.main" },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 11 }} />
          </Box>
        )}
        {onAdjust && (
          <Box component="span" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAdjust(e); }}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: "5px",
              color: overtime > 0 ? "warning.main" : "text.disabled",
              "&:hover": { backgroundColor: "rgba(237,108,2,0.1)" },
            }}
          >
            <MoreTimeIcon sx={{ fontSize: 11 }} />
          </Box>
        )}
      </Box>

      {/* Daily hours */}
      <Typography sx={{
        fontSize: "0.68rem", fontWeight: 700, color: scheduleColor.text, flexShrink: 0, opacity: 0.8, ml: 0.25,
      }}>
        {hours}h
      </Typography>
    </Box>
  );
}

// ─── Swimlane row (schedule row with droppable day cells) ───
interface SwimlaneRowProps {
  schedule: Schedule;
  scheduleColor: ColorScheme;
  currentWeek: Array<{ day: string; date: string; isoDate: string }>;
  filteredEmployees: Employee[];
  getDaySchedule: (employee: Employee, day: string, date: string) => {
    label: string; isUnassigned: boolean; hours: number;
    overtime: number; periodTotal: number; periodOvertime: number;
    scheduleColor: ColorScheme;
  };
  selectedEmployeeIds: Set<number>;
  toggleEmployeeSelection: (employeeId: number, ctrlKey: boolean) => void;
  handleCardClick: (employee: Employee, day: string, date: string) => (e: React.MouseEvent<HTMLElement>) => void;
  canEdit: boolean | undefined;
  isDark: boolean;
  onInfoClick?: (employee: Employee) => void;
  onAdjustClick?: (employee: Employee) => void;
}

function SwimlaneRow({
  schedule, scheduleColor, currentWeek, filteredEmployees,
  getDaySchedule, selectedEmployeeIds, toggleEmployeeSelection,
  handleCardClick, canEdit, isDark,
  onInfoClick, onAdjustClick,
}: SwimlaneRowProps) {
  const theme = useTheme();

  return (
    <Paper elevation={0} sx={{
      borderRadius: "12px",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
      overflow: "hidden", flexShrink: 0,
    }}>
      <Box sx={{
        px: 1.5, py: 0.75, display: "flex", alignItems: "center", gap: 1,
        backgroundColor: scheduleColor.bg,
        borderBottom: `1px solid ${scheduleColor.border}`,
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: scheduleColor.text, flex: 1 }}>
          {schedule.label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 0.5, px: 0.75, py: 0.75, overflowX: "auto" }}>
        {currentWeek.map(({ day, date, isoDate }) => {
          const todayDate = isToday(isoDate);
          const isWeekend = day === "saturday" || day === "sunday";
          const isDayAvailable = schedule.days.includes(day.toLowerCase());
          const assignedEmployees = isDayAvailable
            ? filteredEmployees.filter((emp) => getDaySchedule(emp, day, date).label === schedule.label)
            : [];
          const columnId = `swim-${schedule.id}-${day}`;

          return (
            <SwimlaneDayCell
              key={day} columnId={columnId}
              day={day} date={date}
              isTodayDate={todayDate} isWeekend={isWeekend}
              isDark={isDark}
              scheduleLabel={schedule.label}
            >
              <Box sx={{
                px: 1.25, py: 0.85, textAlign: "center",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                backgroundColor: todayDate
                  ? (isDark ? "rgba(56,189,248,0.1)" : "rgba(56,189,248,0.07)")
                  : "transparent",
                transition: "background-color 0.15s ease",
              }}>
                <Typography sx={{
                  fontWeight: todayDate ? 700 : 600, fontSize: "0.75rem",
                  color: todayDate ? "#38bdf8" : theme.palette.text.primary,
                  letterSpacing: todayDate ? "0.02em" : "normal",
                }}>
                  {capitalizeFirstLetter(translateDayToAbrevSpanish(day as EnglishDayOfWeek))}
                </Typography>
                <Typography sx={{
                  fontSize: "0.58rem", fontWeight: todayDate ? 600 : 400,
                  color: todayDate ? "#38bdf8" : theme.palette.text.secondary,
                  mt: 0.1,
                }}>
                  {formatHeaderDate(date)}
                </Typography>
              </Box>
              {isDayAvailable ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {assignedEmployees.map((emp) => {
                    const empSchedule = getDaySchedule(emp, day, date);
                    const isSelected = selectedEmployeeIds.has(emp.id);
                    return (
                      <DraggableSwimlaneCard
                        key={emp.id}
                        employee={emp} schedule={schedule}
                        day={day} date={date}
                        scheduleColor={scheduleColor}
                        hours={empSchedule.hours}
                        overtime={empSchedule.overtime}
                        periodTotal={empSchedule.periodTotal}
                        periodOvertime={empSchedule.periodOvertime}
                        isSelected={isSelected}
                        toggleSelection={toggleEmployeeSelection}
                        handleCardClick={handleCardClick}
                        canEdit={canEdit}
                        onInfo={onInfoClick ? () => onInfoClick(emp) : undefined}
                        onAdjust={onAdjustClick ? () => onAdjustClick(emp) : undefined}
                        theme={theme}
                      />
                    );
                  })}
                  {assignedEmployees.length === 0 && (
                    <Typography sx={{
                      fontSize: "0.55rem", color: theme.palette.text.disabled,
                      opacity: 0.3, textAlign: "center", py: 0.35,
                    }}>—</Typography>
                  )}
                </Box>
              ) : (
                <Typography sx={{
                  fontSize: "0.55rem", color: theme.palette.text.disabled,
                  opacity: 0.25, textAlign: "center", py: 0.35,
                }}>
                  {SELECTOR_TABLE.NO_AVAILABLE}
                </Typography>
              )}
            </SwimlaneDayCell>
          );
        })}
      </Box>
    </Paper>
  );
}

// ─── Swimlane day cell (droppable) ───
interface SwimlaneDayCellProps {
  columnId: string;
  day: string;
  date: string;
  isTodayDate: boolean;
  isWeekend: boolean;
  children: React.ReactNode;
  isDark: boolean;
  scheduleLabel?: string;
}

function SwimlaneDayCell({ columnId, day, date, isTodayDate, isWeekend, children, isDark, scheduleLabel }: SwimlaneDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { viewType: 'schedule', day, date, scheduleLabel } satisfies DropColumnData,
  });

  const dropHighlight = isOver ? {
    borderColor: "#818cf8",
    boxShadow: `inset 0 0 0 2px ${isDark ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.25)"}`,
    backgroundColor: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)",
  } : {};

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: isWeekend ? 0.7 : 1, minWidth: isWeekend ? 90 : 120, p: 0.6,
        borderRadius: "8px",
        backgroundColor: isTodayDate
          ? (isDark ? "rgba(56,189,248,0.06)" : "rgba(56,189,248,0.04)")
          : "transparent",
        border: isTodayDate
          ? `1px solid ${isDark ? "rgba(56,189,248,0.2)" : "rgba(56,189,248,0.15)"}`
          : "1px solid transparent",
        transition: "all 0.25s ease",
        ...dropHighlight,
      }}
    >
      {children}
    </Box>
  );
}

// ─── Totals Column (droppable) ───
interface TotalsColumnProps {
  employeeDataMap: Map<number, { totalHours: number; overtime: number; hasWorked: boolean }>;
  filteredEmployees: Employee[];
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  onInfoClick?: (employee: Employee) => void;
  onAdjustClick?: (employee: Employee) => void;
  handleAdjustTime?: (employeeId: number, condition: "add" | "subtract", timeAdjustment: number) => void;
  theme: Theme;
  isDark: boolean;
}

function TotalsColumn({
  employeeDataMap, filteredEmployees, selectedPeriod, onPeriodChange,
  onInfoClick, onAdjustClick, handleAdjustTime: onAdjust, theme, isDark,
}: TotalsColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "totals-column",
    data: { viewType: 'totals', day: '', date: '' } satisfies DropColumnData,
  });

  const dropHighlight = isOver ? {
    borderColor: "#818cf8",
    boxShadow: `inset 0 0 0 2px ${isDark ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.25)"}`,
    backgroundColor: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)",
  } : {};

  const [dialogEmpId, setDialogEmpId] = useState<number | null>(null);
  const [dialogHours, setDialogHours] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<{ employeeId: number; condition: "add" | "subtract"; hours: number } | null>(null);

  const openDialog = (empId: number) => {
    setDialogEmpId(empId);
    setDialogHours("");
  };

  const closeDialog = () => {
    setDialogEmpId(null);
    setDialogHours("");
  };

  const handleDialogConfirm = (condition: "add" | "subtract") => {
    if (dialogEmpId === null) return;
    const h = parseFloat(dialogHours);
    if (isNaN(h) || h <= 0) return;
    const empId = dialogEmpId;
    closeDialog();
    setPendingEdit({ employeeId: empId, condition, hours: h });
    requestAnimationFrame(() => setConfirmOpen(true));
  };

  const applyPending = () => {
    if (!pendingEdit) return;
    onAdjust?.(pendingEdit.employeeId, pendingEdit.condition, pendingEdit.hours);
    setConfirmOpen(false);
    setPendingEdit(null);
    closeDialog();
  };

  const cancelPending = () => {
    setConfirmOpen(false);
    setPendingEdit(null);
  };

  const confirmDialogEmployee = pendingEdit
    ? filteredEmployees.find(e => e.id === pendingEdit.employeeId)
    : null;

  const dialogEmployee = dialogEmpId !== null
    ? filteredEmployees.find(e => e.id === dialogEmpId)
    : null;
  const dialogEmpColor = dialogEmployee ? getEmployeeColor(dialogEmployee.id) : "#7c3aed";
  const dialogInitials = dialogEmployee
    ? getInitials(dialogEmployee.firstName, dialogEmployee.lastName)
    : "";

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 0.6, minWidth: 180, maxWidth: { xs: 180, sm: 240, md: 300 },
        display: "flex", flexDirection: "column",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        backgroundColor: isDark ? "rgba(124,58,237,0.05)" : "rgba(124,58,237,0.03)",
        transition: "all 0.25s ease",
        ...dropHighlight,
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 1.5, py: 1.25, textAlign: "center",
      }}>
        {/* Period toggle */}
        <Box sx={{
          display: "flex", gap: 0.3, justifyContent: "center",
          backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
          borderRadius: "10px", p: 0.35,
        }}>
          {PERIOD_OPTIONS.map((opt) => (
            <Box
              key={opt.value}
              onClick={() => onPeriodChange(opt.value)}
              sx={{
                display: "flex", alignItems: "center", gap: 0.5, px: 0.9, py: 0.5,
                borderRadius: "8px", cursor: "pointer", userSelect: "none",
                fontSize: "0.7rem",
                fontWeight: selectedPeriod === opt.value ? 700 : 500,
                color: selectedPeriod === opt.value
                  ? (isDark ? "#a78bfa" : "#7c3aed")
                  : theme.palette.text.secondary,
                backgroundColor: selectedPeriod === opt.value
                  ? (isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)")
                  : "transparent",
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor: selectedPeriod === opt.value
                    ? undefined
                    : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                },
              }}
            >
              {opt.icon}
              <Typography sx={{ fontSize: "0.7rem", fontWeight: "inherit", color: "inherit", lineHeight: 1.2 }}>
                {opt.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {/* Employee rows — draggable to assign */}
      <Box sx={{
        flex: 1, p: 0.75, display: "flex", flexDirection: "column", gap: 0.5,
        overflowY: "auto", minHeight: 80,
      }}>
        {filteredEmployees.map((employee) => {
          const empData = employeeDataMap.get(employee.id);
          const hours = empData?.totalHours ?? 0;
          const overtime = empData?.overtime ?? 0;
          const empColor = getEmployeeColor(employee.id);
          return (
            <Box key={employee.id} sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <DraggableTotalsRow
                  employee={employee} hours={hours} overtime={overtime}
                  empColor={empColor} isDark={isDark}
                  onInfoClick={onInfoClick}
                  onAdjustClick={onAdjustClick}
                  theme={theme}
                />
              </Box>
              {onAdjust && (
                <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 0.35 }}>
                  <Box
                    onClick={(e) => { e.stopPropagation(); openDialog(employee.id); }}
                    title="Ajustar horas"
                    sx={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: "7px", cursor: "pointer",
                      fontSize: "1rem", fontWeight: 700, lineHeight: 1,
                      color: "text.secondary",
                      transition: "all 0.15s ease",
                      "&:hover": { backgroundColor: isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.08)", color: "#a78bfa" },
                    }}
                  >±</Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {/* Footer - total */}
      <Box sx={{
        px: 1.5, py: 0.65, textAlign: "center",
        backgroundColor: isDark ? "rgba(139,92,246,0.06)" : "rgba(139,92,246,0.03)",
      }}>
        <Typography sx={{
          fontSize: "0.72rem", fontWeight: 800,
          color: isDark ? "#a78bfa" : "#7c3aed",
          letterSpacing: "-0.02em",
        }}>
          {Array.from(employeeDataMap.values()).reduce((s, d) => s + d.totalHours, 0)}h totales
        </Typography>
      </Box>

      {/* Adjust hours dialog */}
      <Dialog open={dialogEmpId !== null} onClose={closeDialog} maxWidth="xs" fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: "blur(6px)", backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)" } },
          paper: { sx: { borderRadius: "20px", boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.6)" : "0 24px 80px rgba(0,0,0,0.15)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "none" } },
        }}
      >
        <Box sx={{ p: 3, textAlign: "center", backgroundColor: isDark ? "rgba(18,18,24,0.98)" : undefined, borderRadius: "20px" }}>
          {/* Employee avatar */}
          <Box sx={{
            width: 60, height: 60, borderRadius: "50%",
            backgroundColor: dialogEmpColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            mx: "auto", mb: 1.5,
            boxShadow: `0 4px 16px ${dialogEmpColor}60`,
          }}>
            <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
              {dialogInitials}
            </Typography>
          </Box>

          {/* Title */}
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 0.25, color: isDark ? "#e8e8f0" : undefined }}>
            Ajustar horas
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 2 }}>
            {dialogEmployee?.firstName} {dialogEmployee?.lastName?.[0]}
          </Typography>

          {/* Accent bar */}
          <Box sx={{ width: 36, height: 3.5, borderRadius: 2, mx: "auto", mb: 2.5, backgroundColor: "#a78bfa" }} />

          {/* Hours input */}
          <TextField
            autoFocus
            fullWidth
            placeholder="0"
            type="number"
            value={dialogHours}
            onChange={(e) => setDialogHours(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleDialogConfirm("add"); }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                minHeight: "42px",
                backgroundColor: isDark ? "rgba(40,40,50,0.6)" : "rgba(255,255,255,0.7)",
                color: theme.palette.text.primary,
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: isDark ? "rgba(50,50,60,0.7)" : "rgba(255,255,255,0.85)",
                  borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                "&.Mui-focused": {
                  backgroundColor: isDark ? "rgba(55,55,65,0.8)" : "rgba(255,255,255,0.95)",
                  borderColor: "#a78bfa",
                  boxShadow: `0 0 0 3px ${isDark ? "rgba(167,139,250,0.15)" : "rgba(167,139,250,0.1)"}`,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                "& fieldset": { border: "none" },
                "& input": {
                  color: theme.palette.text.primary,
                  fontSize: "0.9rem",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  textAlign: "center",
                  "&::placeholder": {
                    color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
                    opacity: 1,
                  },
                },
              },
            }}
          />

          {/* Add / Subtract buttons */}
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Button fullWidth size="medium" variant="contained" onClick={() => handleDialogConfirm("subtract")}
              disabled={!dialogHours || parseFloat(dialogHours) <= 0}
              sx={{
                borderRadius: "12px", textTransform: "none", fontWeight: 700, fontSize: "0.9rem", py: 1,
                backgroundColor: "#ef4444", color: "#fff",
                "&:hover": { backgroundColor: "#dc2626" },
                "&.Mui-disabled": { backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)", color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" },
              }}
            >
              − Restar
            </Button>
            <Button fullWidth size="medium" variant="contained" onClick={() => handleDialogConfirm("add")}
              disabled={!dialogHours || parseFloat(dialogHours) <= 0}
              sx={{
                borderRadius: "12px", textTransform: "none", fontWeight: 700, fontSize: "0.9rem", py: 1,
                backgroundColor: "#34d399", color: "#fff",
                "&:hover": { backgroundColor: "#2ecc71" },
                "&.Mui-disabled": { backgroundColor: isDark ? "rgba(52,211,153,0.12)" : "rgba(52,211,153,0.08)", color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" },
              }}
            >
              + Agregar
            </Button>
          </Box>

          {/* Cancel */}
          <Button fullWidth size="small" onClick={closeDialog}
            sx={{
              borderRadius: "8px", textTransform: "none", fontWeight: 500, color: "text.secondary", py: 0.75,
              "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
            }}
          >
            Cancelar
          </Button>
        </Box>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onClose={cancelPending} maxWidth="xs" fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: "blur(6px)", backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)" } },
          paper: { sx: { borderRadius: "20px", boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.6)" : "0 24px 80px rgba(0,0,0,0.15)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "none" } },
        }}
      >
        <Box sx={{ p: 3, textAlign: "center", backgroundColor: isDark ? "rgba(18,18,24,0.98)" : undefined, borderRadius: "20px" }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: "50%",
            backgroundColor: pendingEdit?.condition === "add"
              ? (isDark ? "rgba(52,211,153,0.15)" : "rgba(52,211,153,0.1)")
              : (isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)"),
            display: "flex", alignItems: "center", justifyContent: "center",
            mx: "auto", mb: 1.5,
          }}>
            <Typography sx={{ fontSize: "1.5rem" }}>
              {pendingEdit?.condition === "add" ? "+" : "−"}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, mb: 0.5, color: isDark ? "#e8e8f0" : undefined }}>
            {pendingEdit?.condition === "add" ? "Agregar horas" : "Restar horas"}
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1.5, lineHeight: 1.5 }}>
            {pendingEdit
              ? `Se ${pendingEdit.condition === "add" ? "agregarán" : "restarán"} ${pendingEdit.hours}h ${pendingEdit.condition === "add" ? "a" : "de"} ${confirmDialogEmployee?.firstName ?? ""} ${confirmDialogEmployee?.lastName?.[0] ?? ""}.`
              : ""}
          </Typography>

          <Box sx={{ width: 36, height: 3.5, borderRadius: 2, mx: "auto", mb: 2.5,
            backgroundColor: pendingEdit?.condition === "add" ? "#34d399" : "#ef4444",
          }} />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button fullWidth size="medium" onClick={cancelPending}
              sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, py: 1, color: "text.secondary",
                "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
              }}
            >
              Cancelar
            </Button>
            <Button fullWidth size="medium" variant="contained" onClick={applyPending}
              sx={{
                borderRadius: "12px", textTransform: "none", fontWeight: 600, py: 1,
                backgroundColor: pendingEdit?.condition === "add" ? "#34d399" : "#ef4444",
                "&:hover": { backgroundColor: pendingEdit?.condition === "add" ? "#2ecc71" : "#dc2626" },
              }}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

// ─── Day Column ───
interface DayColumnProps {
  columnId: string;
  day: string; date: string; isTodayDate: boolean; isWeekend: boolean;
  employees: Array<{
    employee: Employee; scheduleLabel: string; scheduleColor: ColorScheme;
    hours: number; overtime: number; isUnassigned: boolean;
    periodTotal: number; periodOvertime: number;
  }>;
  totalHours: number;
  onEmployeeClick: (employee: Employee, event: React.MouseEvent<HTMLElement>) => void;
  onInfoClick?: (employee: Employee) => void;
  onAdjustClick?: (employee: Employee) => void;
  theme: Theme;
}

const DayColumn = memo(function DayColumn({
  columnId, day, date, isTodayDate, isWeekend, employees, totalHours,
  onEmployeeClick, onInfoClick, onAdjustClick, theme,
}: DayColumnProps) {
  const isDark = theme.palette.mode === "dark";
  const todayColor = "#38bdf8";

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { viewType: 'employee', day, date } satisfies DropColumnData,
  });

  const dropHighlight = isOver ? {
    borderColor: "#818cf8",
    boxShadow: `inset 0 0 0 2px ${isDark ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.25)"}`,
    backgroundColor: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)",
  } : {};

  return (
    <Box ref={setNodeRef} data-column-id={columnId} sx={{
      flex: isWeekend ? 0.7 : 1,
      minWidth: isWeekend ? 110 : 140,
      maxWidth: isWeekend ? 130 : 190,
      display: "flex", flexDirection: "column",
      backgroundColor: isTodayDate
        ? (isDark ? "rgba(56,189,248,0.06)" : "rgba(56,189,248,0.04)")
        : isWeekend
          ? (isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)")
          : "transparent",
      borderRadius: "12px",
      border: isTodayDate
        ? `1.5px solid ${isDark ? "rgba(56,189,248,0.3)" : "rgba(56,189,248,0.2)"}`
        : `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
      overflow: "hidden",
      transition: "all 0.25s ease",
      ...dropHighlight,
    }}>
      {/* Day header */}
      <Box data-anchor-id={`anchor-${columnId}`} sx={{
        px: 1.25, py: 0.85, textAlign: "center",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        backgroundColor: isTodayDate
          ? (isDark ? "rgba(56,189,248,0.1)" : "rgba(56,189,248,0.07)")
          : "transparent",
        transition: "background-color 0.15s ease",
      }}>
        <Typography sx={{
          fontWeight: isTodayDate ? 700 : 600, fontSize: "0.75rem",
          color: isTodayDate ? todayColor : theme.palette.text.primary,
          letterSpacing: isTodayDate ? "0.02em" : "normal",
        }}>
          {capitalizeFirstLetter(translateDayToAbrevSpanish(day as EnglishDayOfWeek))}
        </Typography>
        <Typography sx={{
          fontSize: "0.58rem", fontWeight: isTodayDate ? 600 : 400,
          color: isTodayDate ? todayColor : theme.palette.text.secondary,
          mt: 0.1,
        }}>
          {formatHeaderDate(date)}
        </Typography>
      </Box>

      {/* Cards area */}
      <Box sx={{
        flex: 1, p: 0.6, display: "flex", flexDirection: "column", gap: 0.5,
        overflowY: "auto", minHeight: 80,
      }}>
        {employees.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: "0.65rem", color: theme.palette.text.disabled, opacity: 0.4 }}>—</Typography>
          </Box>
        ) : (
          employees.map((emp) => (
            <DraggableCardWrapper
              key={`${emp.employee.id}-${emp.scheduleLabel}`}
              employee={emp.employee} scheduleLabel={emp.scheduleLabel} scheduleColor={emp.scheduleColor}
              hours={emp.hours} overtime={emp.overtime} isUnassigned={emp.isUnassigned}
              periodTotal={emp.periodTotal} periodOvertime={emp.periodOvertime}
              sourceDay={day} sourceDate={date}
              onClick={(e) => onEmployeeClick(emp.employee, e)}
              onInfo={onInfoClick ? () => onInfoClick(emp.employee) : undefined}
              onAdjust={onAdjustClick ? () => onAdjustClick(emp.employee) : undefined}
              theme={theme}
            />
          ))
        )}
      </Box>

      {/* Column footer — total */}
      <Box sx={{
        px: 1.25, py: 0.55,
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        textAlign: "center",
        backgroundColor: isTodayDate
          ? (isDark ? "rgba(56,189,248,0.07)" : "rgba(56,189,248,0.05)")
          : "transparent",
      }}>
        <Typography sx={{
          fontSize: "0.68rem", fontWeight: 700,
          color: totalHours > 0 ? todayColor : theme.palette.text.disabled,
        }}>
          {totalHours > 0 ? `${totalHours}h` : "—"}
        </Typography>
      </Box>
    </Box>
  );
});

// ─── Main WeeklyBoard ───
const WeeklyBoard: React.FC<WeeklyBoardProps> = ({
  filteredEmployees, schedules, hoursWorked,
  weeklySummaries, biweeklySummaries, monthlySummaries,
  weekOffset, weekNumber, biweekNumber, month, year,
   handleChange, handleAdjustTime, permissions,
  viewMode, setViewMode,
  onInfoClick, onAdjustClick,
  recalculateEmployeeWeeklySummary,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("weekly");
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");

  // ─── Multi-select state ───
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());

  const toggleEmployeeSelection = useCallback((employeeId: number, ctrlKey: boolean) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (ctrlKey) {
        if (next.has(employeeId)) next.delete(employeeId);
        else next.add(employeeId);
      } else {
        if (next.size > 0 && next.has(employeeId)) next.clear();
        else { next.clear(); next.add(employeeId); }
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEmployeeIds(new Set());
  }, []);

  // ─── Keyboard: Escape clears selection ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSelection();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [clearSelection]);

  // ─── Drag and drop state ───
  const [activeDragItem, setActiveDragItem] = useState<DragItemData | null>(null);

  const canEdit = permissions?.includes(PERMISSIONS.EDIT_EMPLOYEE_ROLES);
  const showHours = permissions?.includes(PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as DragItemData);
  }, []);

  const currentWeek = useMemo(() => getCurrentWeekDates(weekOffset), [weekOffset]);
  const multiplePeriods = useMemo(() => getInvolvedPeriods(currentWeek), [currentWeek]);

  const scheduleColorMap = useMemo(() => {
    const map = new Map<string, ColorScheme>();
    const uniqueLabels = [...new Set(schedules.map((s) => s.label))];
    uniqueLabels.forEach((label, idx) => map.set(label, getScheduleColor(label, idx)));
    return map;
  }, [schedules]);

  // Per-employee period totals
  const employeeDataMap = useMemo(() => {
    const map = new Map<number, { totalHours: number; overtime: number; hasWorked: boolean }>();
    filteredEmployees.forEach((emp) => {
      const totalH = calculateTotalHours(emp, selectedPeriod, currentWeek, weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries, multiplePeriods);
      const overT = calculateOvertime(emp, selectedPeriod, currentWeek, weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries, multiplePeriods);
      const hasWkd = weeklySummaries.some(
        (s) => s.employeeId === emp.id && s.weekNumber === weekNumber && s.year === year && Number(s.totalHours) > 0,
      );
      map.set(emp.id, { totalHours: Number(totalH), overtime: Number(overT), hasWorked: hasWkd });
    });
    return map;
  }, [filteredEmployees, selectedPeriod, currentWeek, weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries, multiplePeriods]);

  const getDaySchedule = useCallback(
    (employee: Employee, day: string, date: string) => {
      const cellData = getScheduleCellData(employee, day, date, schedules, hoursWorked);
      const label = cellData.finalSelectedLabel;
      const isUnassigned = label === SELECTOR_TABLE.UNASSIGNED;
      const matchingSchedule = schedules.find((s) => s.label === label && s.days.includes(day.toLowerCase()));
      const empData = employeeDataMap.get(employee.id);
      return {
        label, isUnassigned, hours: matchingSchedule ? getScheduleHours(matchingSchedule, day) : 0,
        overtime: empData?.overtime ?? 0,
        periodTotal: empData?.totalHours ?? 0,
        periodOvertime: empData?.overtime ?? 0,
        scheduleColor: isUnassigned
          ? { bg: "transparent", text: theme.palette.text.disabled, border: "transparent" }
          : scheduleColorMap.get(label) ?? SCHEDULE_COLORS[0],
      };
    },
    [schedules, hoursWorked, scheduleColorMap, employeeDataMap, theme],
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;
    const sourceData = active.data.current as DragItemData | undefined;
    const targetData = over.data.current as DropColumnData | undefined;
    if (!sourceData || !targetData) return;

    const targetDate = new Date(targetData.date);
    const targetDay = targetData.day.toLowerCase();

    // ── Determine which employees to apply the change to ──
    let involvedIds: number[];
    if (sourceData.sourceType === 'totals') {
      involvedIds = [sourceData.employee.id];
    } else {
      const selected = Array.from(selectedEmployeeIds);
      if (selected.length > 0 && selected.includes(sourceData.employee.id)) {
        involvedIds = selected;
      } else {
        involvedIds = [sourceData.employee.id];
      }
    }

    // ── Dropped on totals column: unassign ──
    if (targetData.viewType === 'totals') {
      if (!canEdit) return;
      if (sourceData.sourceType === 'card') {
        const sourceDate = new Date(sourceData.sourceDate);
        involvedIds.forEach((eid) => handleChange(SELECTOR_TABLE.UNASSIGNED, eid, sourceDate));
        if (involvedIds.length > 1) clearSelection();
      }
      return;
    }

    // ── Source from totals column: assign immediately + open popover to change ──
    if (sourceData.sourceType === 'totals') {
      if (!canEdit) return;
      // Si el empleado ya está asignado a este día, cancelar (solo snap-back)
      const empAssignedToday = getDaySchedule(sourceData.employee, targetData.day, targetData.date);
      if (!empAssignedToday.isUnassigned) return;

      if (targetData.viewType === 'schedule' && targetData.scheduleLabel) {
        // ── Dropping on a swimlane cell: assign directly to that schedule ──
        const scheduleForCell = schedules.find(
          (s) => s.label === targetData.scheduleLabel && s.days.includes(targetDay),
        );
        if (!scheduleForCell) return;
        involvedIds.forEach((eid) => handleChange(scheduleForCell.label, eid, targetDate));
        if (involvedIds.length > 1) clearSelection();
        return;
      }

      // ── Dropping on an employee day column: assign first available + popover ──
      const firstAvailable = schedules.find((s) => s.days.includes(targetDay));
      if (!firstAvailable) return;
      // Assign immediately so the card appears in the column
      involvedIds.forEach((eid) => handleChange(firstAvailable.label, eid, targetDate));
      // Open popover for single employee so they can change the schedule
      if (involvedIds.length === 1) {
        const anchorEl = document.querySelector(`[data-anchor-id="anchor-day-col-${targetData.day}"]`);
        if (anchorEl) {
          setSelectedEmployee(sourceData.employee);
          setSelectedDay(targetData.day);
          setSelectedDateStr(targetData.date);
          setPopoverAnchor(anchorEl as HTMLElement);
        }
      } else {
        clearSelection();
      }
      return;
    }

    // ── Source from card: determine schedule label to assign ──
    if (sourceData.sourceDay === targetData.day && involvedIds.length === 1) return;

    let scheduleToAssign: string | null = null;
    const sourceLabel = sourceData.scheduleLabel;
    const scheduleExists = schedules.some(
      (s) => s.label === sourceLabel && s.days.includes(targetDay),
    );

    if (scheduleExists) {
      scheduleToAssign = sourceLabel;
    } else {
      const firstAvailable = schedules.find((s) => s.days.includes(targetDay));
      if (firstAvailable) scheduleToAssign = firstAvailable.label;
    }

    if (!scheduleToAssign) return;

    // ── Swap detection (only for single-employee drags) ──
    if (involvedIds.length === 1) {
      const sourceEmp = filteredEmployees.find((e) => e.id === involvedIds[0]);
      if (sourceEmp) {
        for (const emp of filteredEmployees) {
          if (emp.id === involvedIds[0]) continue;
          const existing = getDaySchedule(emp, targetData.day, targetData.date);
          if (!existing.isUnassigned && existing.label === scheduleToAssign) {
            const oldLabel = getDaySchedule(sourceEmp, sourceData.sourceDay, sourceData.sourceDate).label;
            if (oldLabel && oldLabel !== SELECTOR_TABLE.UNASSIGNED) {
              handleChange(oldLabel, emp.id, targetDate);
            } else {
              handleChange(SELECTOR_TABLE.UNASSIGNED, emp.id, targetDate);
            }
            break;
          }
        }
      }
    }

    // ── Remove from source day (move, not duplicate) ──
    const sourceDate = new Date(sourceData.sourceDate);
    involvedIds.forEach((eid) => handleChange(SELECTOR_TABLE.UNASSIGNED, eid, sourceDate));

    // ── Apply to all involved employees ──
    involvedIds.forEach((eid) => handleChange(scheduleToAssign!, eid, targetDate));
    if (involvedIds.length > 1) clearSelection();
  }, [schedules, handleChange, canEdit, selectedEmployeeIds, filteredEmployees, getDaySchedule, clearSelection]);


  const handleCardClick = useCallback(
    (employee: Employee, day: string, date: string) => (e: React.MouseEvent<HTMLElement>) => {
      if (!canEdit) return;
      e.stopPropagation();
      setSelectedEmployee(employee); setSelectedDay(day); setSelectedDateStr(date);
      setPopoverAnchor(e.currentTarget);
    }, [canEdit]);

  const handleClosePopover = useCallback(() => {
    setPopoverAnchor(null); setSelectedEmployee(null); setSelectedDay(""); setSelectedDateStr("");
  }, []);

  const handleScheduleSelect = useCallback(
    (scheduleLabel: string) => {
      if (!selectedEmployee || !selectedDateStr) return;
      const date = new Date(selectedDateStr);
      handleChange(scheduleLabel, selectedEmployee.id, date);
      // Recalcular resúmenes para actualizar horas totales
      if (recalculateEmployeeWeeklySummary) {
        recalculateEmployeeWeeklySummary(selectedEmployee.id, date);
      }
      handleClosePopover();
    }, [selectedEmployee, selectedDateStr, handleChange, recalculateEmployeeWeeklySummary, handleClosePopover]);

  const popoverOptions = useMemo(() => {
    if (!selectedDay) return [];
    return schedules.filter((s) => s.days.includes(selectedDay.toLowerCase()))
      .map((s) => ({ label: s.label, hours: getScheduleHours(s, selectedDay), color: scheduleColorMap.get(s.label) ?? SCHEDULE_COLORS[0] }));
  }, [selectedDay, schedules, scheduleColorMap]);

  const popoverCurrentLabel = useMemo(() => {
    if (!selectedEmployee || !selectedDateStr) return "";
    return getScheduleCellData(selectedEmployee, "", selectedDateStr, schedules, hoursWorked).finalSelectedLabel;
  }, [selectedEmployee, selectedDateStr, schedules, hoursWorked]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* ─── Header ─── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: { xs: 1.5, sm: 2 }, py: 1, gap: 1,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        flexShrink: 0, flexWrap: "wrap",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* View toggle - at the start */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 0.25,
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            borderRadius: "8px", p: 0.15,
          }}>
            {(["employee", "schedule"] as const).map((mode) => (
              <Box
                key={mode}
                onClick={() => setViewMode(mode)}
                sx={{
                  px: 1, py: 0.35, borderRadius: "7px", cursor: "pointer", userSelect: "none",
                  fontSize: "0.65rem",
                  fontWeight: viewMode === mode ? 700 : 500,
                  color: viewMode === mode
                    ? (isDark ? "#38bdf8" : "#6366f1")
                    : theme.palette.text.secondary,
                  backgroundColor: viewMode === mode
                    ? (isDark ? "rgba(56,189,248,0.1)" : "rgba(99,102,241,0.08)")
                    : "transparent",
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: viewMode === mode
                      ? undefined
                      : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  },
                }}
              >
                <Typography sx={{
                  fontSize: "0.65rem", fontWeight: "inherit", color: "inherit",
                  lineHeight: 1.2, display: "flex", alignItems: "center", gap: 0.4,
                }}>                    {mode === "employee" ? (
                    <><PeopleOutlineIcon sx={{ fontSize: 14 }} /> Calendario Individual</>
                  ) : (
                    <><ViewTimelineIcon sx={{ fontSize: 14 }} /> Calendario por Horario</>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>


        </Box>
      </Box>


      {/* ─── Board ─── */}
      <Box sx={{
        flex: 1, overflowX: "auto", overflowY: "hidden",
        px: { xs: 0.75, sm: 1.25 }, py: 1.25,
      }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {viewMode === "employee" ? (
            <Box sx={{ display: "flex", gap: 1, height: "100%", minHeight: 350 }}>
              {currentWeek.map(({ day, date, isoDate }) => {
                const todayDate = isToday(isoDate);
                const isWeekend = day === "saturday" || day === "sunday";
                const dayEmployees: DayColumnProps["employees"] = [];
                filteredEmployees.forEach((employee) => {
                  const sched = getDaySchedule(employee, day, date);
                  if (sched.isUnassigned) {
                    // No mostrar empleados sin asignar — aparecen hasta que se arrastren
                  } else {
                    dayEmployees.push({
                      employee, scheduleLabel: sched.label, scheduleColor: sched.scheduleColor,
                      hours: sched.hours, overtime: sched.overtime, isUnassigned: false,
                      periodTotal: sched.periodTotal, periodOvertime: sched.periodOvertime,
                    });
                  }
                });
                return (
                  <DayColumn
                    key={day} columnId={`day-col-${day}`} day={day} date={date}
                    isTodayDate={todayDate} isWeekend={isWeekend}
                    employees={dayEmployees}
                    totalHours={dayEmployees.reduce((sum, e) => sum + e.hours, 0)}
                    onEmployeeClick={(emp, event) => handleCardClick(emp, day, date)(event)}
                    onInfoClick={showHours ? onInfoClick : undefined}
                    onAdjustClick={showHours ? onAdjustClick : undefined}
                    theme={theme}
                  />
                );
              })}
              <TotalsColumn
                employeeDataMap={employeeDataMap}
                filteredEmployees={filteredEmployees}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                onInfoClick={showHours ? onInfoClick : undefined}
                onAdjustClick={showHours ? onAdjustClick : undefined}
                handleAdjustTime={handleAdjustTime}
                theme={theme}
                isDark={isDark}
              />
            </Box>
          ) : (
            /* ─── Schedule view (swimlanes) with drag & drop + totals column ─── */
            <Box sx={{ display: "flex", gap: 1, height: "100%", minHeight: 350 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, height: "100%", overflowY: "auto", flex: 1 }}>
                {schedules.map((schedule) => {
                  const scheduleColor = scheduleColorMap.get(schedule.label) ?? SCHEDULE_COLORS[0];
                  return (
                    <SwimlaneRow
                      key={schedule.id}
                      schedule={schedule}
                      scheduleColor={scheduleColor}
                      currentWeek={currentWeek}
                      filteredEmployees={filteredEmployees}
                      getDaySchedule={getDaySchedule}
                      selectedEmployeeIds={selectedEmployeeIds}
                      toggleEmployeeSelection={toggleEmployeeSelection}
                      handleCardClick={handleCardClick}
                      canEdit={canEdit}
                      isDark={isDark}
                      onInfoClick={onInfoClick}
                      onAdjustClick={onAdjustClick}
                    />
                  );
                })}
              </Box>
              <TotalsColumn
                employeeDataMap={employeeDataMap}
                filteredEmployees={filteredEmployees}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                onInfoClick={showHours ? onInfoClick : undefined}
                onAdjustClick={showHours ? onAdjustClick : undefined}
                handleAdjustTime={handleAdjustTime}
                theme={theme}
                isDark={isDark}
              />
            </Box>
          )}

          <DragOverlay dropAnimation={null}>
            {activeDragItem?.sourceType === 'card' ? (
              <DragOverlayCard
                employee={activeDragItem.employee}
                scheduleLabel={activeDragItem.scheduleLabel}
                scheduleColor={activeDragItem.scheduleColor}
                hours={activeDragItem.hours}
                periodTotal={activeDragItem.periodTotal}
                periodOvertime={activeDragItem.periodOvertime}
                isUnassigned={activeDragItem.isUnassigned}
                isDark={isDark}
              />
            ) : activeDragItem?.sourceType === 'totals' ? (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 1.5, py: 1.25, borderRadius: "12px",
                backgroundColor: isDark ? "rgba(30,30,40,0.95)" : "rgba(255,255,255,0.95)",
                border: `2px solid ${isDark ? "#a78bfa" : "#7c3aed"}`,
                boxShadow: isDark
                  ? "0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)"
                  : "0 12px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.9)",
                transform: "rotate(-3deg) scale(1.08)",
                backdropFilter: "blur(8px)",
                width: 160,
              }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: getEmployeeColor(activeDragItem.employee.id),
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
                }}>
                  {getInitials(activeDragItem.employee.firstName, activeDragItem.employee.lastName)}
                </Box>
                <Typography sx={{
                  fontSize: "0.8rem", fontWeight: 700,
                  color: isDark ? "#a78bfa" : "#7c3aed",
                  lineHeight: 1.2,
                }}>
                  {activeDragItem.employee.firstName}
                </Typography>
                <Typography sx={{
                  fontSize: "0.5rem", fontWeight: 600, color: "text.secondary",
                  ml: "auto", opacity: 0.6, lineHeight: 1,
                }}>
                  Asignar
                </Typography>
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>

      {/* ─── Popover ─── */}
      <Popover
        open={!!popoverAnchor} anchorEl={popoverAnchor} onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: isDark ? "0 10px 40px rgba(0,0,0,0.4)" : "0 10px 40px rgba(0,0,0,0.12)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
              maxHeight: 280, minWidth: 170, overflow: "auto", mt: 0.5,
            },
          },
        }}
      >
        <List dense sx={{ py: 0.5 }}>
          {popoverCurrentLabel && popoverCurrentLabel !== SELECTOR_TABLE.UNASSIGNED && (
            <Box sx={{
              px: 1.5, py: 0.75,
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            }}>
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 600, color: "text.secondary", mb: 0.35 }}>
                Actual
              </Typography>
              <Chip
                label={popoverCurrentLabel} size="small"
                sx={{
                  fontWeight: 600, fontSize: "0.65rem", height: 22,
                  backgroundColor: scheduleColorMap.get(popoverCurrentLabel)?.bg ?? "transparent",
                  color: scheduleColorMap.get(popoverCurrentLabel)?.text ?? theme.palette.text.primary,
                  border: `1px solid ${scheduleColorMap.get(popoverCurrentLabel)?.border ?? "transparent"}`,
                }}
              />
            </Box>
          )}
          {popoverOptions.map((option) => (
            <ListItemButton
              key={option.label}
              onClick={() => handleScheduleSelect(option.label)}
              selected={option.label === popoverCurrentLabel}
              sx={{
                mx: 0.5, borderRadius: "7px", my: 0.2, px: 1.25, py: 0.75,
                "&.Mui-selected": { backgroundColor: option.color.bg },
                "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" },
              }}
            >
              <Box sx={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: option.color.text, mr: 1.25, flexShrink: 0,
              }} />
              <ListItemText
                primary={option.label}
                primaryTypographyProps={{
                  fontSize: "0.78rem",
                  fontWeight: option.label === popoverCurrentLabel ? 700 : 500,
                }}
              />
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 600, color: option.color.text, ml: 1 }}>
                {option.hours}h
              </Typography>
            </ListItemButton>
          ))}
          <ListItemButton
            onClick={() => handleScheduleSelect(SELECTOR_TABLE.UNASSIGNED)}
            selected={popoverCurrentLabel === SELECTOR_TABLE.UNASSIGNED}
            sx={{
              mx: 0.5, borderRadius: "7px", my: 0.2, px: 1.25, py: 0.75,
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
              mt: 0.5,
              "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" },
            }}
          >
            <ListItemText
              primary={SELECTOR_TABLE.UNASSIGNED}
              primaryTypographyProps={{
                fontSize: "0.78rem",
                fontWeight: popoverCurrentLabel === SELECTOR_TABLE.UNASSIGNED ? 700 : 400,
                color: "text.disabled",
              }}
            />
          </ListItemButton>
        </List>
      </Popover>
    </Box>
  );
};

export default memo(WeeklyBoard);
