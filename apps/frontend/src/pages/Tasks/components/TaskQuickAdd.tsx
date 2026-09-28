import React, { useEffect, useRef, useState } from "react";
import { Box, ButtonBase, IconButton, InputBase, Tooltip, useTheme } from "@mui/material";
import {
  IconBell,
  IconCalendarDue,
  IconFlag,
  IconFlagFilled,
  IconList,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { TaskInput, TaskList, TaskPriority } from "../../../models/Task";
import { useTimeFormat } from "../../../hooks/useTimeFormat";
import {
  formatDueDate,
  formatReminder,
  INBOX_LABEL,
  isListView,
  LIST_COLORS,
  listIdOfView,
  PRIORITY_OPTIONS,
  priorityColor,
  TaskView,
  todayISO,
} from "../taskUtils";
import { DueDateMenu, ListMenu, PriorityMenu, ReminderMenu } from "./TaskPickers";

interface TaskQuickAddProps {
  view: TaskView;
  lists: TaskList[];
  onAdd: (input: TaskInput) => Promise<unknown>;
  autoFocus?: boolean;
}

const Chip: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  color?: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  onClear?: () => void;
}> = ({ icon, label, active, color, onClick, onClear }) => {
  const { colors, borders } = useTheme().tokens;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 28,
        borderRadius: "8px",
        border: active ? `1px solid ${color ?? colors.accent}40` : borders.hairline,
        backgroundColor: active ? `${color ?? colors.accent}14` : "transparent",
        color: active ? color ?? colors.accent : colors.textMuted,
        overflow: "hidden",
      }}
    >
      <ButtonBase
        onClick={onClick}
        sx={{
          height: "100%",
          px: 1,
          gap: 0.6,
          fontSize: "0.75rem",
          fontWeight: 600,
          fontFamily: "inherit",
          "&:hover": { backgroundColor: colors.hover },
        }}
      >
        {icon}
        {label}
      </ButtonBase>
      {active && onClear && (
        <ButtonBase
          aria-label={`Quitar ${label}`}
          onClick={onClear}
          sx={{ height: "100%", px: 0.5, "&:hover": { backgroundColor: colors.hover } }}
        >
          <IconX size={13} />
        </ButtonBase>
      )}
    </Box>
  );
};

// Inline "add task" composer. Defaults follow the current view (Hoy → due
// today, Importantes → starred, a list → that list); Enter adds and keeps the
// field focused for the next one.
export const TaskQuickAdd: React.FC<TaskQuickAddProps> = ({ view, lists, onAdd, autoFocus }) => {
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const { is24h } = useTimeFormat();
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultDue = view === "today" ? todayISO() : null;
  const defaultList = listIdOfView(view) ?? null;

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(defaultDue);
  const [remindAt, setRemindAt] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(0);
  const [listId, setListId] = useState<number | null>(defaultList);
  const [anchor, setAnchor] = useState<{ el: HTMLElement; kind: "due" | "reminder" | "priority" | "list" } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDueDate(view === "today" ? todayISO() : null);
    setListId(listIdOfView(view) ?? null);
    setRemindAt(null);
    setPriority(0);
  }, [view]);

  const submit = async () => {
    const text = title.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    const created = await onAdd({
      title: text,
      dueDate,
      remindAt,
      priority,
      listId,
      isImportant: view === "important",
    });
    setSubmitting(false);
    if (created) {
      setTitle("");
      setRemindAt(null);
      setPriority(0);
      setDueDate(defaultDue);
      inputRef.current?.focus();
    }
  };

  const listName =
    listId === null ? INBOX_LABEL : lists.find((list) => list.id === listId)?.name ?? INBOX_LABEL;
  const listColor = listId ? LIST_COLORS[lists.find((list) => list.id === listId)?.color ?? "indigo"] : undefined;
  const expanded = title.trim().length > 0 || Boolean(remindAt) || priority > 0;

  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: borders.paper,
        backgroundColor: colors.surface,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        "&:focus-within": { borderColor: colors.accent, boxShadow: `0 0 0 3px ${colors.accentSoft}` },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, height: 48 }}>
        <Box sx={{ display: "grid", placeItems: "center", color: colors.accent }}>
          <IconPlus size={20} />
        </Box>
        <InputBase
          inputRef={inputRef}
          autoFocus={autoFocus}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void submit();
            }
            if (event.key === "Escape") setTitle("");
          }}
          placeholder="Agregar una tarea"
          inputProps={{ "aria-label": "Agregar una tarea", maxLength: 500 }}
          sx={{ flex: 1, fontSize: "0.925rem" }}
        />
        {title.trim() && (
          <Tooltip title="Agregar (Enter)">
            <IconButton
              size="small"
              aria-label="Agregar tarea"
              onClick={() => void submit()}
              disabled={submitting}
              sx={{ backgroundColor: colors.accent, color: colors.onAccent, "&:hover": { backgroundColor: colors.accentStrong } }}
            >
              <IconPlus size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.75,
          px: 1.5,
          pb: 1.25,
          pt: 0.25,
          borderTop: expanded ? borders.hairline : "none",
          ...(expanded ? { pt: 1.25 } : {}),
        }}
      >
        <Chip
          icon={<IconCalendarDue size={14} />}
          label={dueDate ? formatDueDate(dueDate) : "Fecha"}
          active={Boolean(dueDate)}
          onClick={(event) => setAnchor({ el: event.currentTarget, kind: "due" })}
          onClear={() => setDueDate(null)}
        />
        <Chip
          icon={<IconBell size={14} />}
          label={remindAt ? formatReminder(remindAt, is24h) : "Recordatorio"}
          active={Boolean(remindAt)}
          onClick={(event) => setAnchor({ el: event.currentTarget, kind: "reminder" })}
          onClear={() => setRemindAt(null)}
        />
        <Chip
          icon={priority > 0 ? <IconFlagFilled size={14} /> : <IconFlag size={14} />}
          label={priority > 0 ? PRIORITY_OPTIONS[priority].label : "Prioridad"}
          active={priority > 0}
          color={priority > 0 ? priorityColor(priority, theme) : undefined}
          onClick={(event) => setAnchor({ el: event.currentTarget, kind: "priority" })}
          onClear={() => setPriority(0)}
        />
        {!isListView(view) && (
          <Chip
            icon={<IconList size={14} />}
            label={listName}
            active={listId !== null}
            color={listColor}
            onClick={(event) => setAnchor({ el: event.currentTarget, kind: "list" })}
            onClear={() => setListId(null)}
          />
        )}
      </Box>

      <DueDateMenu
        anchorEl={anchor?.kind === "due" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        dueDate={dueDate}
        onChange={(value) => setDueDate(value)}
      />
      <ReminderMenu
        anchorEl={anchor?.kind === "reminder" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        remindAt={remindAt}
        onChange={setRemindAt}
      />
      <PriorityMenu
        anchorEl={anchor?.kind === "priority" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        priority={priority}
        onChange={setPriority}
      />
      <ListMenu
        anchorEl={anchor?.kind === "list" ? anchor.el : null}
        onClose={() => setAnchor(null)}
        lists={lists}
        listId={listId}
        onChange={setListId}
      />
    </Box>
  );
};

export default TaskQuickAdd;
