import React, { useState } from "react";
import {
  Box,
  ButtonBase,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconArrowRight,
  IconBell,
  IconBellCheck,
  IconCalendarDue,
  IconCheck,
  IconCopy,
  IconDots,
  IconGripVertical,
  IconListCheck,
  IconNote,
  IconPencil,
  IconRepeat,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { Task, TaskInput, TaskList } from "../../../models/Task";
import {
  formatDueDate,
  formatReminder,
  formatTime,
  INBOX_LABEL,
  isOverdue,
  LIST_COLORS,
  priorityColor,
  todayISO,
} from "../taskUtils";

interface TaskItemProps {
  task: Task;
  lists: TaskList[];
  selected: boolean;
  showList: boolean;
  onOpen: (task: Task) => void;
  onPatch: (id: number, input: TaskInput) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Drag handle (sortable lists only). */
  dragHandle?: React.ReactNode;
}

// Round, priority-tinted checkbox (Todoist / Things style).
export const TaskCheckbox: React.FC<{
  checked: boolean;
  priority: Task["priority"];
  onToggle: () => void;
  size?: number;
  label: string;
}> = ({ checked, priority, onToggle, size = 20, label }) => {
  const theme = useTheme();
  const { colors } = theme.tokens;
  const ring = priority > 0 ? priorityColor(priority, theme) : colors.textSubtle;
  return (
    <ButtonBase
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      sx={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1.75px solid ${checked ? colors.accent : ring}`,
        backgroundColor: checked ? colors.accent : priority > 0 ? `${ring}14` : "transparent",
        color: checked ? colors.onAccent : ring,
        transition: "background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease",
        "& svg": { opacity: checked ? 1 : 0, transition: "opacity 0.15s ease" },
        "&:hover svg": { opacity: 1 },
        "&:active": { transform: "scale(0.9)" },
        "&.Mui-focusVisible": { outline: theme.tokens.borders.focus, outlineOffset: 2 },
      }}
    >
      <IconCheck size={size * 0.6} stroke={3} />
    </ButtonBase>
  );
};

const Meta: React.FC<{ icon: React.ReactNode; children?: React.ReactNode; color?: string; title?: string }> = ({
  icon,
  children,
  color,
  title,
}) => (
  <Box
    component="span"
    title={title}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.4,
      color,
      whiteSpace: "nowrap",
      "& svg": { flexShrink: 0 },
    }}
  >
    {icon}
    {children}
  </Box>
);

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  lists,
  selected,
  showList,
  onOpen,
  onPatch,
  onDuplicate,
  onDelete,
  dragHandle,
}) => {
  const theme = useTheme();
  const { colors } = theme.tokens;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [moveAnchor, setMoveAnchor] = useState<HTMLElement | null>(null);

  const completed = Boolean(task.completedAt);
  const overdue = isOverdue(task);
  const dueToday = task.dueDate === todayISO();
  const list = task.listId ? lists.find((item) => item.id === task.listId) : null;
  const stepsDone = task.subtasks.filter((step) => step.done).length;

  const meta: React.ReactNode[] = [];
  if (showList) {
    meta.push(
      <Meta
        key="list"
        icon={
          <Box
            component="span"
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: list ? LIST_COLORS[list.color] : colors.textSubtle,
            }}
          />
        }
      >
        {list?.name ?? INBOX_LABEL}
      </Meta>,
    );
  }
  if (task.dueDate) {
    meta.push(
      <Meta
        key="due"
        icon={<IconCalendarDue size={13} />}
        color={completed ? undefined : overdue ? colors.error : dueToday ? colors.accent : undefined}
      >
        {formatDueDate(task.dueDate)}
        {task.dueTime && `, ${formatTime(task.dueTime)}`}
      </Meta>,
    );
  }
  if (task.remindAt && !completed) {
    meta.push(
      <Meta
        key="reminder"
        icon={task.reminderSentAt ? <IconBellCheck size={13} /> : <IconBell size={13} />}
        title={task.reminderSentAt ? "Recordatorio enviado" : "Recordatorio"}
      >
        {formatReminder(task.remindAt)}
      </Meta>,
    );
  }
  if (task.recurrence !== "none") meta.push(<Meta key="repeat" icon={<IconRepeat size={13} />} title="Se repite" />);
  if (task.subtasks.length > 0) {
    meta.push(
      <Meta key="steps" icon={<IconListCheck size={13} />}>
        {stepsDone}/{task.subtasks.length}
      </Meta>,
    );
  }
  if (task.notes) meta.push(<Meta key="notes" icon={<IconNote size={13} />} title="Tiene notas" />);

  const closeMenus = () => {
    setMenuAnchor(null);
    setMoveAnchor(null);
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Abrir tarea: ${task.title}`}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target === event.currentTarget) onOpen(task);
      }}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        px: { xs: 1, sm: 1.5 },
        py: 1.1,
        borderRadius: "10px",
        cursor: "pointer",
        backgroundColor: selected ? colors.selected : "transparent",
        transition: "background-color 0.12s ease",
        "&:hover": { backgroundColor: selected ? colors.selected : colors.hover },
        "&:hover .task-hover, &:focus-within .task-hover": { opacity: 1 },
        "&:focus-visible": { outline: theme.tokens.borders.focus, outlineOffset: -2 },
      }}
    >
      {dragHandle && (
        <Box
          className="task-hover"
          sx={{
            position: "absolute",
            left: -18,
            top: 10,
            opacity: { xs: 0, md: 0 },
            color: colors.textSubtle,
            display: { xs: "none", md: "flex" },
          }}
        >
          {dragHandle}
        </Box>
      )}
      <Box sx={{ pt: "1px" }}>
        <TaskCheckbox
          checked={completed}
          priority={task.priority}
          label={completed ? "Marcar como pendiente" : "Marcar como completada"}
          onToggle={() => onPatch(task.id, { completed: !completed })}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 500,
            lineHeight: 1.4,
            color: completed ? colors.textMuted : colors.text,
            textDecoration: completed ? "line-through" : "none",
            wordBreak: "break-word",
          }}
        >
          {task.title}
        </Typography>
        {meta.length > 0 && (
          <Box
            sx={{
              mt: 0.35,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              columnGap: 1.25,
              rowGap: 0.25,
              fontSize: "0.75rem",
              color: colors.textMuted,
            }}
          >
            {meta}
          </Box>
        )}
      </Box>

      <Tooltip title={task.isImportant ? "Quitar de importantes" : "Marcar como importante"}>
        <IconButton
          size="small"
          aria-label={task.isImportant ? "Quitar de importantes" : "Marcar como importante"}
          aria-pressed={task.isImportant}
          onClick={(event) => {
            event.stopPropagation();
            onPatch(task.id, { isImportant: !task.isImportant });
          }}
          sx={{
            mt: -0.4,
            color: task.isImportant ? colors.warning : colors.textSubtle,
            opacity: task.isImportant ? 1 : { xs: 1, md: 0 },
          }}
          className={task.isImportant ? undefined : "task-hover"}
        >
          {task.isImportant ? <IconStarFilled size={17} /> : <IconStar size={17} />}
        </IconButton>
      </Tooltip>
      <IconButton
        size="small"
        aria-label="Más acciones"
        aria-haspopup="menu"
        className="task-hover"
        onClick={(event) => {
          event.stopPropagation();
          setMenuAnchor(event.currentTarget);
        }}
        sx={{ mt: -0.4, color: colors.textMuted, opacity: { xs: 1, md: 0 } }}
      >
        <IconDots size={17} />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenus}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            closeMenus();
            onOpen(task);
          }}
        >
          <ListItemIcon>
            <IconPencil size={17} />
          </ListItemIcon>
          <ListItemText>Editar detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={(event) => setMoveAnchor(event.currentTarget)}>
          <ListItemIcon>
            <IconArrowRight size={17} />
          </ListItemIcon>
          <ListItemText>Mover a…</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenus();
            onDuplicate(task);
          }}
        >
          <ListItemIcon>
            <IconCopy size={17} />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenus();
            onDelete(task);
          }}
          sx={{ color: colors.error }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <IconTrash size={17} />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={moveAnchor}
        open={Boolean(moveAnchor)}
        onClose={closeMenus}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {[{ id: null as number | null, name: INBOX_LABEL, color: null as string | null }, ...lists.map((item) => ({
          id: item.id as number | null,
          name: item.name,
          color: LIST_COLORS[item.color] as string | null,
        }))].map((target) => (
          <MenuItem
            key={target.id ?? "inbox"}
            selected={task.listId === target.id}
            onClick={() => {
              closeMenus();
              if (task.listId !== target.id) onPatch(task.id, { listId: target.id });
            }}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  ml: 0.5,
                  backgroundColor: target.color ?? colors.textSubtle,
                }}
              />
            </ListItemIcon>
            <ListItemText>{target.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export const DragGrip: React.FC = () => <IconGripVertical size={16} />;

export default TaskItem;
