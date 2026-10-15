import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { DocumentFolderDTO } from "../../../services/documentService";
import type { ExplorerSelection } from "../../../components/DocumentExplorer/DocumentExplorer.component";

interface MoveDialogProps {
  open: boolean;
  folders: DocumentFolderDTO[];
  selection: ExplorerSelection;
  onClose: () => void;
  onMoved: (targetFolderId: number | null) => void;
}

// Mueve archivos y/o carpetas a otra carpeta del mismo ámbito (o a la raíz).
const MoveDialog: React.FC<MoveDialogProps> = ({ open, folders, selection, onClose, onMoved }) => {
  const theme = useTheme();
  const { colors } = theme.tokens;
  const [target, setTarget] = useState<number | "root">("root");

  useEffect(() => {
    if (open) setTarget("root");
  }, [open]);

  // Carpetas con sangría según su profundidad, para el selector.
  const ordered = useMemo(() => {
    const byParent = new Map<number | null, DocumentFolderDTO[]>();
    for (const folder of folders) {
      const key = folder.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(folder);
    }
    const result: { folder: DocumentFolderDTO; depth: number }[] = [];
    const walk = (parent: number | null, depth: number) => {
      (byParent.get(parent) ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((folder) => {
          result.push({ folder, depth });
          walk(folder.id, depth + 1);
        });
    };
    walk(null, 0);
    return result;
  }, [folders]);

  // Carpetas bloqueadas: las seleccionadas y sus descendientes (evita ciclos).
  const blocked = useMemo(() => {
    const children = new Map<number, number[]>();
    for (const folder of folders) {
      if (folder.parentId != null) {
        if (!children.has(folder.parentId)) children.set(folder.parentId, []);
        children.get(folder.parentId)!.push(folder.id);
      }
    }
    const result = new Set<number>(selection.folders.map((folder) => folder.id));
    const stack = [...result];
    while (stack.length) {
      const id = stack.pop() as number;
      for (const child of children.get(id) ?? []) {
        if (!result.has(child)) {
          result.add(child);
          stack.push(child);
        }
      }
    }
    return result;
  }, [folders, selection.folders]);

  const count = selection.documents.length + selection.folders.length;
  const disabled = count === 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Mover</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: colors.textMuted, mb: 2 }}>
          {count === 1 ? "Moverás 1 elemento." : `Moverás ${count} elementos.`}
        </Typography>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Mover a"
          value={target}
          onChange={(event) => {
            const value = event.target.value;
            setTarget(value === "root" ? "root" : Number(value));
          }}
        >
          <MenuItem value="root">Raíz</MenuItem>
          {ordered.map(({ folder, depth }) => (
            <MenuItem key={folder.id} value={folder.id} disabled={blocked.has(folder.id)} sx={{ pl: 2 + depth * 2 }}>
              {folder.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={() => onMoved(target === "root" ? null : target)}
          sx={{ textTransform: "none" }}
        >
          Mover
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveDialog;
