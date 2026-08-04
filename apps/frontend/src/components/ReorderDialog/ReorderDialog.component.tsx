import React, { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RotateCcw, X } from "lucide-react";
import type { Schedule } from "../../models/Schedule";
import { sortSchedulesByType } from "../../utils/schedule";

interface SortableItemProps {
  schedule: Schedule;
  index: number;
  dragHandle?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ schedule, index }) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const,
  };

  const daysSpanish: Record<string, string> = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    sunday: "Dom",
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: "10px",
        backgroundColor:
          theme.palette.mode === "dark"
            ? isDragging
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.03)"
            : isDragging
            ? "rgba(0,0,0,0.06)"
            : "rgba(0,0,0,0.015)",
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.05)"
        }`,
        transition: "all 0.2s ease",
        userSelect: "none",
        "&:hover": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.025)",
        },
      }}
    >
      {/* Drag handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          color: theme.palette.text.disabled,
          opacity: 0.4,
          transition: "opacity 0.2s",
          flexShrink: 0,
          "&:hover": { opacity: 0.8 },
          "&:active": { cursor: "grabbing" },
          touchAction: "none",
        }}
      >
        <GripVertical size={18} strokeWidth={1.5} />
      </Box>

      {/* Order number */}
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: theme.palette.text.secondary,
          }}
        >
          {index + 1}
        </Typography>
      </Box>

      {/* Schedule info */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color: theme.palette.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {schedule.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.7rem",
            color: theme.palette.text.disabled,
          }}
        >
          {schedule.days.map((d) => daysSpanish[d] || d).join(", ")}
          {" · "}
          {schedule.hours}h
        </Typography>
      </Box>

    </Box>
  );
};

interface ReorderDialogProps {
  open: boolean;
  schedules: Schedule[];
  onClose: () => void;
  onSave: (orderedIds: number[]) => void;
}

const ReorderDialog: React.FC<ReorderDialogProps> = ({
  open,
  schedules,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<Schedule[]>(() => [...schedules]);

  // Reset items when dialog opens with new schedules
  React.useEffect(() => {
    if (open) {
      setItems([...schedules]);
    }
  }, [open, schedules]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleSave = () => {
    onSave(items.map((s) => s.id));
    onClose();
  };

  // Reset the list to the default (alphabetical) order
  const handleReset = useCallback(() => {
    setItems(sortSchedulesByType([...schedules]));
  }, [schedules]);

  // Whether the current draft already matches the default (alphabetical) order
  const isDefaultOrder = useMemo(() => {
    const defaultOrder = sortSchedulesByType([...schedules]);
    return (
      items.length === defaultOrder.length &&
      items.every((item, i) => item.id === defaultOrder[i]?.id)
    );
  }, [items, schedules]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)"
          }`,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: theme.palette.text.primary,
              letterSpacing: "-0.02em",
            }}
          >
            Ordenar horarios
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.72rem",
              color: theme.palette.text.secondary,
              mt: 0.25,
              display: "block",
            }}
          >
            Arrastra los horarios para reordenarlos
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Sortable list */}
      <DialogContent sx={{ px: 2, py: 2, overflowY: "auto", maxHeight: "60vh" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {items.map((schedule, index) => (
                <SortableItem
                  key={schedule.id}
                  schedule={schedule}
                  index={index}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)"
          }`,
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            width: "100%",
          }}
        >
          <Button
            variant="text"
            startIcon={<RotateCcw size={15} strokeWidth={2} />}
            onClick={handleReset}
            disabled={isDefaultOrder}
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                color: theme.palette.text.primary,
              },
            }}
          >
            Restaurar orden
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ fontWeight: 600 }}
            >
              Guardar orden
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ReorderDialog;
