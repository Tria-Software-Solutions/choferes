import React, { useMemo } from "react";
import { IconChecks } from "@tabler/icons-react";
import { useTheme } from "@mui/material";
import type { Task } from "../../../models/Task";
import { StatusBadge } from "../../../components/Layout";
import type { StatTone } from "../../../components/Layout";
import { describeDue, pendingTasks, sortTasks } from "../panelModel";
import { EmptyHint, ListRow, RowStack, RowText } from "./panelParts";

const PRIORITY: Record<number, { label: string; tone: StatTone } | undefined> = {
  3: { label: "Alta", tone: "danger" },
  2: { label: "Media", tone: "warning" },
  1: { label: "Baja", tone: "info" },
};

interface TasksListProps {
  tasks: Task[];
  todayIso: string;
  limit?: number;
  onOpen: () => void;
}

// Pendientes personales por vencimiento (mismo origen que la página Tareas).
// Cada fila lleva a la página completa, donde se pueden completar y editar.
export const TasksList: React.FC<TasksListProps> = ({ tasks, todayIso, limit = 8, onOpen }) => {
  const { colors } = useTheme().tokens;

  const visible = useMemo(
    () => sortTasks(pendingTasks(tasks)).slice(0, limit),
    [tasks, limit],
  );

  if (visible.length === 0) {
    return (
      <EmptyHint
        icon={<IconChecks />}
        tone="success"
        title="Todo al día"
        description="No tienes tareas pendientes."
      />
    );
  }

  const railColor: Record<number, string | undefined> = {
    3: colors.error,
    2: colors.warning,
    1: colors.info,
  };

  return (
    <RowStack sx={{ flex: 1 }}>
      {visible.map((task) => {
        const due = describeDue(task.dueDate, todayIso);
        const priority = PRIORITY[task.priority];
        const dueText = task.dueTime && task.dueDate ? `${due.label} · ${task.dueTime}` : due.label;
        return (
          <ListRow
            key={task.id}
            rail={railColor[task.priority]}
            onClick={onOpen}
            ariaLabel={`Abrir tareas: ${task.title}`}
            // Las filas se reparten el alto de la tarjeta, sin pasarse de un tope.
            sx={{ flex: "1 1 auto", minHeight: 56, maxHeight: 84 }}
          >
            <RowText
              title={task.title}
              subtitle={dueText}
              subtitleColor={due.tone === "danger" ? colors.error : undefined}
            />
            {priority && <StatusBadge label={priority.label} tone={priority.tone} size="small" />}
          </ListRow>
        );
      })}
    </RowStack>
  );
};
