import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  ButtonBase,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBell,
  IconBellCheck,
  IconCalendarDue,
  IconFlag,
  IconFlagFilled,
  IconList,
  IconPlus,
  IconRepeat,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Task, TaskInput, TaskList, TaskRecurrence } from "../../../models/Task";
import { useTimeFormat } from "../../../hooks/useTimeFormat";
import {
  formatDueDate,
  formatReminder,
  formatTime,
  INBOX_LABEL,
  isOverdue,
  LIST_COLORS,
  newSubtaskId,
  PRIORITY_OPTIONS,
  priorityColor,
  RECURRENCE_OPTIONS,
  TaskPermissions,
} from "../taskUtils";
import { TaskCheckbox } from "./TaskItem";
import { DueDateMenu, ListMenu, PriorityMenu, ReminderMenu } from "./TaskPickers";

interface TaskDetailPanelProps {
  task: Task;
  lists: TaskList[];
  onPatch: (id: number, input: TaskInput) => void;
  onDelete: (task: Task) => void;
  onClose: () => void;
  can: TaskPermissions;
}

const PropertyRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  color?: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  onClear?: () => void;
  disabled?: boolean;
}> = ({ icon, label, value, color, onClick, onClear, disabled = false }) => {
  const { colors } = useTheme().tokens;
  const active = value !== undefined && value !== null && value !== false;
  return (
    <Box sx={{ display: "flex", alignItems: "center", borderRadius: "10px", "&:hover": { backgroundColor: colors.hover } }}>
      <ButtonBase
        onClick={onClick}
        disabled={disabled}
        sx={{
          flex: 1,
          justifyContent: "flex-start",
          gap: 1.5,
          px: 1.25,
          minHeight: 44,
          borderRadius: "10px",
          textAlign: "left",
          fontFamily: "inherit",
          color: active ? color ?? colors.text : colors.textMuted,
        }}
      >
        <Box sx={{ display: "grid", placeItems: "center", color: active ? color ?? colors.accent : colors.textMuted }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: active ? 600 : 500, color: "inherit" }}>
            {active ? value : label}
          </Typography>
          {active && (
            <Typography sx={{ fontSize: "0.6875rem", color: colors.textMuted }}>{label}</Typography>
          )}
        </Box>
      </ButtonBase>
      {active && onClear && !disabled && (
        <Tooltip title={`Quitar ${label.toLowerCase()}`}>
          <IconButton size="small" onClick={onClear} aria-label={`Quitar ${label.toLowerCase()}`} sx={{ mr: 0.5 }}>
            <IconX size={15} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

// Right-hand detail panel (full-screen drawer on phones) of the selected task.
// Every change saves immediately; text fields save on blur.
export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  lists,
  onPatch,
  onDelete,
  onClose,
  can,
}) => {
  const readOnly = !can.edit;
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const { is24h } = useTimeFormat();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [newStep, setNewStep] = useState("");
  const [anchor, setAnchor] = useState<{
    el: HTMLElement;
    kind: "due" | "reminder" | "priority" | "list" | "repeat";
  } | null>(null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes ?? "");
    // Reset only when switching task; live edits of this one stay local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  useEffect(
    () => () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    },
    [],
  );

  const commitTitle = () => {
    const value = title.trim();
    if (!value) {
      setTitle(task.title);
      return;
    }
    if (value !== task.title) onPatch(task.id, { title: value });
  };

  const commitNotes = (value: string) => {
    if (notesTimer.current) clearTimeout(notesTimer.current);
    if ((task.notes ?? "") !== value) onPatch(task.id, { notes: value || null });
  };

  const updateSteps = (subtasks: Task["subtasks"]) => onPatch(task.id, { subtasks });

  const addStep = () => {
    const value = newStep.trim();
    if (!value) return;
    updateSteps([...task.subtasks, { id: newSubtaskId(), title: value, done: false }]);
    setNewStep("");
  };

  const completed = Boolean(task.completedAt);
  const list = task.listId ? lists.find((item) => item.id === task.listId) : null;
  const recurrenceLabel = RECURRENCE_OPTIONS.find((option) => option.value === task.recurrence)?.label;
  const dueLabel = task.dueDate
    ? `${formatDueDate(task.dueDate)}${task.dueTime ? `, ${formatTime(task.dueTime, is24h)}` : ""}`
    : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Title */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, px: 2, pt: 2, pb: 1.5 }}>
        <Box sx={{ pt: "5px" }}>
          <TaskCheckbox
            checked={completed}
            priority={task.priority}
            size={22}
            label={completed ? "Marcar como pendiente" : "Marcar como completada"}
            disabled={readOnly}
            onToggle={() => onPatch(task.id, { completed: !completed })}
          />
        </Box>
        <InputBase
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              (event.target as HTMLElement).blur();
            }
          }}
          multiline
          readOnly={readOnly}
          inputProps={{ "aria-label": "Título de la tarea", maxLength: 500 }}
          sx={{
            flex: 1,
            fontSize: "1.0625rem",
            fontWeight: 700,
            lineHeight: 1.35,
            textDecoration: completed ? "line-through" : "none",
            color: completed ? colors.textMuted : colors.text,
          }}
        />
        <IconButton
          size="small"
          aria-label={task.isImportant ? "Quitar de importantes" : "Marcar como importante"}
          aria-pressed={task.isImportant}
          disabled={readOnly}
          onClick={() => onPatch(task.id, { isImportant: !task.isImportant })}
          sx={{ color: task.isImportant ? colors.warning : colors.textMuted }}
        >
          {task.isImportant ? <IconStarFilled size={19} /> : <IconStar size={19} />}
        </IconButton>
        <IconButton size="small" aria-label="Cerrar detalles" onClick={onClose} sx={{ color: colors.textMuted }}>
          <IconX size={19} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.25, pb: 2 }}>
        {/* Steps */}
        <Box sx={{ mb: 1.5 }}>
          {task.subtasks.map((step) => (
            <Box
              key={step.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.25,
                minHeight: 36,
                borderRadius: "8px",
                "&:hover": { backgroundColor: colors.hover },
                "&:hover .step-delete": { opacity: 1 },
              }}
            >
              <TaskCheckbox
                checked={step.done}
                priority={0}
                size={16}
                disabled={readOnly}
                label={step.done ? "Desmarcar paso" : "Completar paso"}
                onToggle={() =>
                  updateSteps(task.subtasks.map((item) => (item.id === step.id ? { ...item, done: !item.done } : item)))
                }
              />
              <InputBase
                defaultValue={step.title}
                onBlur={(event) => {
                  const value = event.target.value.trim();
                  if (!value) {
                    updateSteps(task.subtasks.filter((item) => item.id !== step.id));
                  } else if (value !== step.title) {
                    updateSteps(task.subtasks.map((item) => (item.id === step.id ? { ...item, title: value } : item)));
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") (event.target as HTMLElement).blur();
                }}
                readOnly={readOnly}
                inputProps={{ "aria-label": "Paso", maxLength: 300 }}
                sx={{
                  flex: 1,
                  fontSize: "0.85rem",
                  textDecoration: step.done ? "line-through" : "none",
                  color: step.done ? colors.textMuted : colors.text,
                }}
              />
              {!readOnly && <IconButton
                size="small"
                className="step-delete"
                aria-label="Eliminar paso"
                onClick={() => updateSteps(task.subtasks.filter((item) => item.id !== step.id))}
                sx={{ opacity: { xs: 1, md: 0 }, color: colors.textMuted }}
              >
                <IconX size={14} />
              </IconButton>}
            </Box>
          ))}
          {!readOnly && <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, minHeight: 36, color: colors.accent }}>
            <IconPlus size={16} />
            <InputBase
              value={newStep}
              onChange={(event) => setNewStep(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addStep();
                }
              }}
              onBlur={addStep}
              placeholder={task.subtasks.length ? "Siguiente paso" : "Agregar paso"}
              inputProps={{ "aria-label": "Agregar paso", maxLength: 300 }}
              sx={{ flex: 1, fontSize: "0.85rem", "& input::placeholder": { color: colors.accent, opacity: 1 } }}
            />
          </Box>}
        </Box>

        {/* Properties */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
            p: 0.5,
            mb: 1.5,
            borderRadius: "12px",
            border: borders.hairline,
            backgroundColor: colors.surfaceSunken,
          }}
        >
          <PropertyRow
            disabled={readOnly}
            icon={<IconCalendarDue size={18} />}
            label="Fecha de vencimiento"
            value={dueLabel}
            color={isOverdue(task) ? colors.error : undefined}
            onClick={(event) => setAnchor({ el: event.currentTarget, kind: "due" })}
            onClear={() => onPatch(task.id, { dueDate: null, dueTime: null })}
          />
          <PropertyRow
            disabled={readOnly}
            icon={task.reminderSentAt ? <IconBellCheck size={18} /> : <IconBell size={18} />}
            label={task.reminderSentAt ? "Recordatorio enviado" : "Recordarme"}
            value={task.remindAt ? formatReminder(task.remindAt, is24h) : undefined}
            onClick={(event) => setAnchor({ el: event.currentTarget, kind: "reminder" })}
            onClear={() => onPatch(task.id, { remindAt: null })}
          />
          <PropertyRow
            disabled={readOnly}
            icon={<IconRepeat size={18} />}
            label="Repetir"
            value={task.recurrence !== "none" ? recurrenceLabel : undefined}
            onClick={(event) => setAnchor({ el: event.currentTarget, kind: "repeat" })}
            onClear={() => onPatch(task.id, { recurrence: "none" })}
          />
          <PropertyRow
            disabled={readOnly}
            icon={task.priority > 0 ? <IconFlagFilled size={18} /> : <IconFlag size={18} />}
            label="Prioridad"
            value={task.priority > 0 ? PRIORITY_OPTIONS[task.priority].label : undefined}
            color={task.priority > 0 ? priorityColor(task.priority, theme) : undefined}
            onClick={(event) => setAnchor({ el: event.currentTarget, kind: "priority" })}
            onClear={() => onPatch(task.id, { priority: 0 })}
          />
          <PropertyRow
            disabled={readOnly}
            icon={
              list ? (
                <Box sx={{ width: 10, height: 10, m: "4px", borderRadius: "50%", backgroundColor: LIST_COLORS[list.color] }} />
              ) : (
                <IconList size={18} />
              )
            }
            label="Lista"
            value={list?.name ?? INBOX_LABEL}
            onClick={(event) => setAnchor({ el: event.currentTarget, kind: "list" })}
          />
        </Box>

        {/* Notes */}
        <TextField
          value={notes}
          onChange={(event) => {
            const { value } = event.target;
            setNotes(value);
            if (notesTimer.current) clearTimeout(notesTimer.current);
            notesTimer.current = setTimeout(() => commitNotes(value), 900);
          }}
          onBlur={() => commitNotes(notes)}
          placeholder={readOnly ? "Sin notas" : "Agregar notas"}
          InputProps={{ readOnly }}
          multiline
          minRows={5}
          inputProps={{ "aria-label": "Notas", maxLength: 10000 }}
          fullWidth
          sx={{ mx: 0.25, width: "calc(100% - 4px)" }}
        />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderTop: borders.hairline,
          color: colors.textMuted,
        }}
      >
        <Typography variant="caption" sx={{ flex: 1, textAlign: "center" }}>
          {task.completedAt
            ? `Completada el ${format(new Date(task.completedAt), is24h ? "EEE d 'de' MMM, HH:mm" : "EEE d 'de' MMM, h:mm a", { locale: es })}`
            : `Creada el ${format(new Date(task.createdAt), "EEE d 'de' MMM", { locale: es })}`}
        </Typography>
        {can.delete && <Tooltip title="Eliminar tarea">
          <IconButton size="small" aria-label="Eliminar tarea" onClick={() => onDelete(task)} sx={{ color: colors.textMuted, "&:hover": { color: colors.error } }}>
            <IconTrash size={18} />
          </IconButton>
        </Tooltip>}
      </Box>

      <DueDateMenu
        anchorEl={anchor?.kind === "due" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        dueDate={task.dueDate}
        dueTime={task.dueTime}
        withTime
        onChange={(dueDate, dueTime) => onPatch(task.id, { dueDate, dueTime: dueDate ? dueTime ?? null : null })}
      />
      <ReminderMenu
        anchorEl={anchor?.kind === "reminder" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        remindAt={task.remindAt}
        onChange={(remindAt) => onPatch(task.id, { remindAt })}
      />
      <PriorityMenu
        anchorEl={anchor?.kind === "priority" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        priority={task.priority}
        onChange={(priority) => onPatch(task.id, { priority })}
      />
      <ListMenu
        anchorEl={anchor?.kind === "list" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        lists={lists}
        listId={task.listId}
        onChange={(listId) => onPatch(task.id, { listId })}
      />
      <Menu anchorEl={anchor?.kind === "repeat" ? anchor.el : null} open={anchor?.kind === "repeat"} onClose={() => setAnchor(null)}>
        {RECURRENCE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={task.recurrence === option.value}
            onClick={() => {
              setAnchor(null);
              onPatch(task.id, { recurrence: option.value as TaskRecurrence });
            }}
          >
            <ListItemIcon>
              <IconRepeat size={17} />
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TaskDetailPanel;
