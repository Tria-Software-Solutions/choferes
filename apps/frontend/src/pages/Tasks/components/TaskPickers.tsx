import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  useTheme,
} from "@mui/material";
import {
  IconBell,
  IconCalendarDue,
  IconCalendarPlus,
  IconCalendarWeek,
  IconFlag,
  IconFlagFilled,
  IconSun,
  IconSunrise,
  IconX,
} from "@tabler/icons-react";
import { TaskList, TaskPriority } from "../../../models/Task";
import {
  dueDateShortcuts,
  fromDateTimeLocal,
  INBOX_LABEL,
  LIST_COLORS,
  PRIORITY_OPTIONS,
  priorityColor,
  reminderShortcuts,
  toDateTimeLocal,
} from "../taskUtils";

interface MenuBaseProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const SHORTCUT_ICONS = [<IconSun size={17} />, <IconSunrise size={17} />, <IconCalendarWeek size={17} />];

// Due date: Hoy / Mañana / Próxima semana, a custom day and an optional time.
export const DueDateMenu: React.FC<
  MenuBaseProps & {
    dueDate: string | null;
    dueTime?: string | null;
    withTime?: boolean;
    onChange: (dueDate: string | null, dueTime?: string | null) => void;
  }
> = ({ anchorEl, onClose, dueDate, dueTime = null, withTime = false, onChange }) => {
  const [customDate, setCustomDate] = useState(dueDate ?? "");
  const [customTime, setCustomTime] = useState(dueTime ?? "");
  useEffect(() => {
    if (anchorEl) {
      setCustomDate(dueDate ?? "");
      setCustomTime(dueTime ?? "");
    }
  }, [anchorEl, dueDate, dueTime]);

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} onClick={(event) => event.stopPropagation()}>
      {dueDateShortcuts().map((option, index) => (
        <MenuItem
          key={option.label}
          selected={dueDate === option.value}
          onClick={() => {
            onChange(option.value, withTime ? dueTime : undefined);
            onClose();
          }}
        >
          <ListItemIcon>{SHORTCUT_ICONS[index]}</ListItemIcon>
          <ListItemText>{option.label}</ListItemText>
        </MenuItem>
      ))}
      <Divider />
      <Box
        sx={{ px: 2, py: 1, display: "flex", flexDirection: "column", gap: 1, width: 260 }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <TextField
          type="date"
          label="Elegir fecha"
          size="small"
          value={customDate}
          onChange={(event) => setCustomDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        {withTime && (
          <TextField
            type="time"
            label="Hora (opcional)"
            size="small"
            value={customTime}
            onChange={(event) => setCustomTime(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        )}
        <Button
          variant="contained"
          size="small"
          disabled={!customDate}
          onClick={() => {
            onChange(customDate, withTime ? customTime || null : undefined);
            onClose();
          }}
        >
          Guardar
        </Button>
      </Box>
      {dueDate && [
        <Divider key="d" />,
        <MenuItem
          key="clear"
          onClick={() => {
            onChange(null, withTime ? null : undefined);
            onClose();
          }}
        >
          <ListItemIcon>
            <IconX size={17} />
          </ListItemIcon>
          <ListItemText>Quitar fecha</ListItemText>
        </MenuItem>,
      ]}
    </Menu>
  );
};

// Reminder: quick instants or a custom date & time.
export const ReminderMenu: React.FC<
  MenuBaseProps & { remindAt: string | null; onChange: (remindAt: string | null) => void }
> = ({ anchorEl, onClose, remindAt, onChange }) => {
  const [custom, setCustom] = useState(toDateTimeLocal(remindAt));
  useEffect(() => {
    if (anchorEl) setCustom(toDateTimeLocal(remindAt));
  }, [anchorEl, remindAt]);

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} onClick={(event) => event.stopPropagation()}>
      {reminderShortcuts().map((option) => (
        <MenuItem
          key={option.label}
          onClick={() => {
            onChange(option.value.toISOString());
            onClose();
          }}
        >
          <ListItemIcon>
            <IconBell size={17} />
          </ListItemIcon>
          <ListItemText>{option.label}</ListItemText>
        </MenuItem>
      ))}
      <Divider />
      <Box
        sx={{ px: 2, py: 1, display: "flex", flexDirection: "column", gap: 1, width: 260 }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <TextField
          type="datetime-local"
          label="Elegir fecha y hora"
          size="small"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button
          variant="contained"
          size="small"
          disabled={!custom || new Date(custom).getTime() <= Date.now()}
          onClick={() => {
            onChange(fromDateTimeLocal(custom));
            onClose();
          }}
        >
          Programar recordatorio
        </Button>
      </Box>
      {remindAt && [
        <Divider key="d" />,
        <MenuItem
          key="clear"
          onClick={() => {
            onChange(null);
            onClose();
          }}
        >
          <ListItemIcon>
            <IconX size={17} />
          </ListItemIcon>
          <ListItemText>Quitar recordatorio</ListItemText>
        </MenuItem>,
      ]}
    </Menu>
  );
};

export const PriorityMenu: React.FC<
  MenuBaseProps & { priority: TaskPriority; onChange: (priority: TaskPriority) => void }
> = ({ anchorEl, onClose, priority, onChange }) => {
  const theme = useTheme();
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} onClick={(event) => event.stopPropagation()}>
      {[...PRIORITY_OPTIONS].reverse().map((option) => (
        <MenuItem
          key={option.value}
          selected={priority === option.value}
          onClick={() => {
            onChange(option.value);
            onClose();
          }}
        >
          <ListItemIcon sx={{ color: priorityColor(option.value, theme) }}>
            {option.value > 0 ? <IconFlagFilled size={17} /> : <IconFlag size={17} />}
          </ListItemIcon>
          <ListItemText>{option.value > 0 ? `Prioridad ${option.label.toLowerCase()}` : option.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

export const ListMenu: React.FC<
  MenuBaseProps & { lists: TaskList[]; listId: number | null; onChange: (listId: number | null) => void }
> = ({ anchorEl, onClose, lists, listId, onChange }) => {
  const { colors } = useTheme().tokens;
  const targets = [
    { id: null as number | null, name: INBOX_LABEL, color: colors.textSubtle },
    ...lists.map((list) => ({ id: list.id as number | null, name: list.name, color: LIST_COLORS[list.color] })),
  ];
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} onClick={(event) => event.stopPropagation()}>
      {targets.map((target) => (
        <MenuItem
          key={target.id ?? "inbox"}
          selected={listId === target.id}
          onClick={() => {
            onChange(target.id);
            onClose();
          }}
        >
          <ListItemIcon>
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", ml: 0.5, backgroundColor: target.color }} />
          </ListItemIcon>
          <ListItemText>{target.name}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

export const DUE_ICON = <IconCalendarDue size={16} />;
export const ADD_DATE_ICON = <IconCalendarPlus size={16} />;
