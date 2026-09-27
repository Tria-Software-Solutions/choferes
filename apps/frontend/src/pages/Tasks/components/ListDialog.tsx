import React, { useEffect, useState } from "react";
import { Box, ButtonBase, TextField, Typography, useTheme } from "@mui/material";
import { IconCheck, IconList } from "@tabler/icons-react";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { TaskList, TaskListColor } from "../../../models/Task";
import { LIST_COLOR_OPTIONS, LIST_COLORS } from "../taskUtils";

interface ListDialogProps {
  open: boolean;
  list: TaskList | null; // null = create
  onClose: () => void;
  onSave: (name: string, color: TaskListColor) => Promise<void> | void;
}

const COLOR_NAMES: Record<TaskListColor, string> = {
  indigo: "Índigo",
  sky: "Celeste",
  emerald: "Verde",
  amber: "Ámbar",
  rose: "Rosa",
  violet: "Violeta",
  slate: "Gris",
};

// Create / rename a list and pick its color.
export const ListDialog: React.FC<ListDialogProps> = ({ open, list, onClose, onSave }) => {
  const { colors } = useTheme().tokens;
  const [name, setName] = useState("");
  const [color, setColor] = useState<TaskListColor>("indigo");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(list?.name ?? "");
      setColor(list?.color ?? "indigo");
    }
  }, [open, list]);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), color);
    setSaving(false);
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title={list ? "Editar lista" : "Nueva lista"}
      icon={<IconList />}
      onConfirm={() => void submit()}
      confirmText={list ? "Guardar" : "Crear lista"}
      loading={saving}
      paperSx={{ maxWidth: 440 }}
    >
      <Box
        component="form"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          void submit();
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          inputProps={{ maxLength: 80 }}
          fullWidth
        />
        <Box>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1, color: colors.textMuted }}>Color</Typography>
          <Box role="radiogroup" aria-label="Color de la lista" sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {LIST_COLOR_OPTIONS.map((option) => (
              <ButtonBase
                key={option}
                role="radio"
                aria-checked={color === option}
                aria-label={COLOR_NAMES[option]}
                onClick={() => setColor(option)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: LIST_COLORS[option],
                  color: "#fff",
                  outline: color === option ? `2px solid ${LIST_COLORS[option]}` : "none",
                  outlineOffset: 2,
                }}
              >
                {color === option && <IconCheck size={16} stroke={3} />}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default ListDialog;
