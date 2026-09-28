import React, { useState } from "react";
import {
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconCalendarEvent,
  IconChecklist,
  IconCircleCheck,
  IconDots,
  IconInbox,
  IconPencil,
  IconPlus,
  IconSearch,
  IconStar,
  IconSun,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Task, TaskList } from "../../../models/Task";
import { countOpen, INBOX_LABEL, LIST_COLORS, SMART_VIEW_LABELS, SmartView, TaskView } from "../taskUtils";

interface TaskSidebarProps {
  view: TaskView;
  onViewChange: (view: TaskView) => void;
  tasks: Task[];
  lists: TaskList[];
  search: string;
  onSearchChange: (value: string) => void;
  /** Omitted when the user can't create lists (tasks:create). */
  onNewList?: () => void;
  /** Omitted without tasks:edit. */
  onEditList?: (list: TaskList) => void;
  /** Omitted without tasks:delete. */
  onDeleteList?: (list: TaskList) => void;
}

const SMART_ICONS: Record<SmartView, React.ReactNode> = {
  today: <IconSun size={18} />,
  upcoming: <IconCalendarEvent size={18} />,
  important: <IconStar size={18} />,
  all: <IconInbox size={18} />,
  completed: <IconCircleCheck size={18} />,
};

const NavRow: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  trailing?: React.ReactNode;
}> = ({ active, icon, label, count, onClick, trailing }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderRadius: "9px",
        backgroundColor: active ? colors.selected : "transparent",
        "&:hover": { backgroundColor: active ? colors.selected : colors.hover },
        "&:hover .row-trailing": { opacity: 1 },
      }}
    >
      <ButtonBase
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        sx={{
          flex: 1,
          minWidth: 0,
          justifyContent: "flex-start",
          gap: 1.25,
          px: 1.25,
          height: 38,
          borderRadius: "9px",
          fontFamily: "inherit",
        }}
      >
        <Box sx={{ display: "grid", placeItems: "center", color: active ? colors.accent : colors.textMuted }}>{icon}</Box>
        <Typography
          noWrap
          sx={{ flex: 1, textAlign: "left", fontSize: "0.85rem", fontWeight: active ? 700 : 500, color: colors.text }}
        >
          {label}
        </Typography>
        {count ? (
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: colors.textMuted, fontVariantNumeric: "tabular-nums" }}>
            {count}
          </Typography>
        ) : null}
      </ButtonBase>
      {trailing}
    </Box>
  );
};

// Views ("Hoy", "Próximos", …) and the user's lists, with open-task counters.
export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  view,
  onViewChange,
  tasks,
  lists,
  search,
  onSearchChange,
  onNewList,
  onEditList,
  onDeleteList,
}) => {
  const { colors } = useTheme().tokens;
  const [menu, setMenu] = useState<{ el: HTMLElement; list: TaskList } | null>(null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%", minHeight: 0 }}>
      <TextField
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar tareas"
        size="small"
        inputProps={{ "aria-label": "Buscar tareas" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={17} />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="Limpiar búsqueda" onClick={() => onSearchChange("")}>
                <IconX size={15} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
      />

      <Box component="nav" aria-label="Vistas de tareas" sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
        {(Object.keys(SMART_VIEW_LABELS) as SmartView[]).map((key) => (
          <NavRow
            key={key}
            active={view === key}
            icon={SMART_ICONS[key]}
            label={SMART_VIEW_LABELS[key]}
            count={countOpen(key, tasks)}
            onClick={() => onViewChange(key)}
          />
        ))}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.25 }}>
        <Typography
          sx={{
            px: 1.25,
            pt: 1,
            pb: 0.5,
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: colors.textMuted,
          }}
        >
          Mis listas
        </Typography>
        <NavRow
          active={view === "inbox"}
          icon={<IconChecklist size={18} />}
          label={INBOX_LABEL}
          count={countOpen("inbox", tasks)}
          onClick={() => onViewChange("inbox")}
        />
        {lists.map((list) => {
          const key: TaskView = `list:${list.id}`;
          return (
            <NavRow
              key={list.id}
              active={view === key}
              icon={<Box sx={{ width: 10, height: 10, m: "4px", borderRadius: "3px", backgroundColor: LIST_COLORS[list.color] }} />}
              label={list.name}
              count={countOpen(key, tasks)}
              onClick={() => onViewChange(key)}
              trailing={
                (onEditList || onDeleteList) && <IconButton
                  size="small"
                  className="row-trailing"
                  aria-label={`Opciones de la lista ${list.name}`}
                  onClick={(event) => setMenu({ el: event.currentTarget, list })}
                  sx={{ mr: 0.5, opacity: { xs: 1, md: 0 }, color: colors.textMuted }}
                >
                  <IconDots size={16} />
                </IconButton>
              }
            />
          );
        })}
        {onNewList && <ButtonBase
          onClick={onNewList}
          sx={{
            justifyContent: "flex-start",
            gap: 1.25,
            px: 1.25,
            height: 38,
            borderRadius: "9px",
            color: colors.accent,
            fontFamily: "inherit",
            fontSize: "0.85rem",
            fontWeight: 600,
            "&:hover": { backgroundColor: colors.hover },
          }}
        >
          <IconPlus size={18} /> Nueva lista
        </ButtonBase>}
      </Box>

      <Menu anchorEl={menu?.el} open={Boolean(menu)} onClose={() => setMenu(null)}>
        {onEditList && <MenuItem
          onClick={() => {
            if (menu) onEditList(menu.list);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <IconPencil size={17} />
          </ListItemIcon>
          <ListItemText>Renombrar o cambiar color</ListItemText>
        </MenuItem>}
        {onDeleteList && <MenuItem
          onClick={() => {
            if (menu) onDeleteList(menu.list);
            setMenu(null);
          }}
          sx={{ color: colors.error }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <IconTrash size={17} />
          </ListItemIcon>
          <ListItemText>Eliminar lista</ListItemText>
        </MenuItem>}
      </Menu>
    </Box>
  );
};

export default TaskSidebar;
