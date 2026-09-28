import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import { useTimeFormat } from "../../../hooks/useTimeFormat";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { format, isValid, parseISO } from "date-fns";
import { TaskList, TaskPriority } from "../../../models/Task";
import {
  dueDateShortcuts,
  INBOX_LABEL,
  LIST_COLORS,
  PRIORITY_OPTIONS,
  priorityColor,
  reminderShortcuts,
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
  const { is24h } = useTimeFormat();
  const [customDate, setCustomDate] = useState(dueDate ?? "");
  const [customTime, setCustomTime] = useState(dueTime ?? "");
  useEffect(() => {
    if (anchorEl) {
      setCustomDate(dueDate ?? "");
      setCustomTime(dueTime ?? "");
    }
  }, [anchorEl, dueDate, dueTime]);

  const dateValue = customDate ? parseISO(customDate) : null;
  const timeValue = customTime ? new Date(`1970-01-01T${customTime}:00`) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
          <DatePicker
            label="Elegir fecha"
            value={dateValue}
            onChange={(date) =>
              setCustomDate(date && isValid(date) ? format(date, "yyyy-MM-dd") : "")
            }
            format="d MMM yyyy"
            slots={{ toolbar: () => null }}
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
          {withTime && (
            <TimePicker
              label="Hora (opcional)"
              value={timeValue}
              onChange={(date) =>
                setCustomTime(date && isValid(date) ? format(date, "HH:mm") : "")
              }
              ampm={!is24h}
              slots={{ toolbar: () => null }}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
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
    </LocalizationProvider>
  );
};

// Reminder: quick instants or a custom date & time.
export const ReminderMenu: React.FC<
  MenuBaseProps & { remindAt: string | null; onChange: (remindAt: string | null) => void }
> = ({ anchorEl, onClose, remindAt, onChange }) => {
  const { is24h } = useTimeFormat();
  const [customValue, setCustomValue] = useState<Date | null>(remindAt ? new Date(remindAt) : null);
  useEffect(() => {
    if (anchorEl) setCustomValue(remindAt ? new Date(remindAt) : null);
  }, [anchorEl, remindAt]);

  const isPast = !customValue || !isValid(customValue) || customValue.getTime() <= Date.now();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
          <DateTimePicker
            label="Elegir fecha y hora"
            value={customValue}
            onChange={(date) => setCustomValue(date && isValid(date) ? date : null)}
            format={is24h ? "d MMM yyyy HH:mm" : "d MMM yyyy h:mm a"}
            ampm={!is24h}
            disablePast
            slots={{ toolbar: () => null }}
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={isPast}
            onClick={() => {
              if (customValue && isValid(customValue)) {
                onChange(customValue.toISOString());
              }
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
    </LocalizationProvider>
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
