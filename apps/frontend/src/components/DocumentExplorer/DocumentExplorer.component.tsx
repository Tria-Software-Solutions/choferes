import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Checkbox,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  IconChevronRight,
  IconDownload,
  IconEye,
  IconFile,
  IconFolder,
  IconFolderOff,
  IconMenu2,
  IconPencil,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { formatBytes } from "../DocumentPreview/DocumentPreview.component";
import { isOfficeDocument } from "../../services/documentService";
import type { DocumentDTO, DocumentFolderDTO } from "../../services/documentService";

/** Selección múltiple del explorador (archivos/carpetas marcados). */
export interface ExplorerSelection {
  documents: DocumentDTO[];
  folders: DocumentFolderDTO[];
}

export interface DocumentExplorerProps {
  folders: DocumentFolderDTO[];
  documents: DocumentDTO[];
  /** Etiqueta del nodo raíz (el ámbito completo). */
  rootLabel: string;
  onPreview?: (doc: DocumentDTO) => void;
  onDownload?: (doc: DocumentDTO) => void;
  /** Abre el editor de oficina (solo para archivos editables y con permiso). */
  onEdit?: (doc: DocumentDTO) => void;
  onDeleteFolder?: (folder: DocumentFolderDTO) => void;
  onDeleteDocument?: (doc: DocumentDTO) => void;
  /** Acciones para la carpeta seleccionada (nueva carpeta, subir archivo). */
  folderActions?: (folderId: number | null) => React.ReactNode;
  /** Activa la selección múltiple (checkboxes + barra de acciones). */
  selectable?: boolean;
  /** Contenido de la barra de acciones cuando hay algo seleccionado. */
  renderSelectionActions?: (
    selection: ExplorerSelection,
    clearSelection: () => void,
  ) => React.ReactNode;
}

const contentRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1.5,
  py: 1,
  borderRadius: "10px",
  transition: "background-color 0.12s ease",
};

// Explorador de documentos: árbol de carpetas a la izquierda y el contenido de
// la carpeta seleccionada a la derecha. En móvil el árbol se abre en un cajón.
const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  folders,
  documents,
  rootLabel,
  onPreview,
  onDownload,
  onEdit,
  onDeleteFolder,
  onDeleteDocument,
  folderActions,
  selectable = false,
  renderSelectionActions,
}) => {
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [treeOpen, setTreeOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lastToggledRef = useRef<number | null>(null);

  const folderById = useMemo(() => new Map(folders.map((folder) => [folder.id, folder])), [folders]);

  const childrenOf = useCallback(
    (parentId: number | null) => folders.filter((folder) => (folder.parentId ?? null) === parentId),
    [folders],
  );

  // Si la carpeta seleccionada desaparece (p. ej. tras eliminarla), vuelve a la raíz.
  useEffect(() => {
    if (selectedId != null && !folderById.has(selectedId)) setSelectedId(null);
  }, [folderById, selectedId]);

  const trail = useMemo(() => {
    const out: DocumentFolderDTO[] = [];
    let cursor = selectedId;
    while (cursor != null) {
      const folder = folderById.get(cursor);
      if (!folder) break;
      out.unshift(folder);
      cursor = folder.parentId ?? null;
    }
    return out;
  }, [folderById, selectedId]);

  // Expande automáticamente la ruta hasta la carpeta seleccionada.
  useEffect(() => {
    if (trail.length <= 1) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      trail.slice(0, -1).forEach((folder) => next.add(folder.id));
      return next;
    });
  }, [trail]);

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearSelection = useCallback(() => {
    setSelected((prev) => (prev.size === 0 ? prev : new Set()));
    lastToggledRef.current = null;
  }, []);

  const select = (id: number | null) => {
    setSelectedId(id);
    setTreeOpen(false);
    clearSelection();
  };

  const treeRow = (opts: {
    label: string;
    depth: number;
    selected: boolean;
    hasChildren?: boolean;
    expanded?: boolean;
    onClick: () => void;
    onToggle?: () => void;
  }) => (
    <Box
      onClick={opts.onClick}
      role="treeitem"
      aria-selected={opts.selected}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        pl: 0.5 + opts.depth * 1.5,
        pr: 1,
        py: 0.5,
        borderRadius: "8px",
        cursor: "pointer",
        color: opts.selected ? colors.accentStrong : colors.text,
        backgroundColor: opts.selected ? colors.accentSoft : "transparent",
        "&:hover": { backgroundColor: opts.selected ? colors.accentSoft : colors.hoverSoft },
      }}
    >
      {opts.hasChildren === undefined ? (
        <Box sx={{ width: 24, flexShrink: 0 }} />
      ) : (
        <IconButton
          size="small"
          aria-label={opts.expanded ? "Contraer carpeta" : "Expandir carpeta"}
          onClick={(event) => {
            event.stopPropagation();
            opts.onToggle?.();
          }}
          sx={{
            p: 0.25,
            width: 24,
            height: 24,
            flexShrink: 0,
            color: "inherit",
            visibility: opts.hasChildren ? "visible" : "hidden",
          }}
        >
          <IconChevronRight
            size={15}
            style={{ transform: opts.expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}
          />
        </IconButton>
      )}
      <Box sx={{ display: "flex", flexShrink: 0, color: opts.selected ? colors.accentStrong : colors.accent }}>
        <IconFolder size={17} />
      </Box>
      <Typography noWrap sx={{ minWidth: 0, fontSize: "0.8125rem", fontWeight: opts.selected ? 700 : 500 }}>
        {opts.label}
      </Typography>
    </Box>
  );

  const renderFolders = (parentId: number | null, depth: number): React.ReactNode =>
    childrenOf(parentId).map((folder) => {
      const kids = childrenOf(folder.id);
      const isOpen = expanded.has(folder.id);
      return (
        <React.Fragment key={folder.id}>
          {treeRow({
            label: folder.name,
            depth,
            selected: selectedId === folder.id,
            hasChildren: kids.length > 0,
            expanded: isOpen,
            onClick: () => select(folder.id),
            onToggle: () => toggleExpanded(folder.id),
          })}
          {isOpen && renderFolders(folder.id, depth + 1)}
        </React.Fragment>
      );
    });

  const tree = (
    <Box role="tree" sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {treeRow({ label: rootLabel, depth: 0, selected: selectedId == null, onClick: () => select(null) })}
      {renderFolders(null, 1)}
    </Box>
  );

  const foldersHere = childrenOf(selectedId);
  const documentsHere = documents.filter((doc) => (doc.folderId ?? null) === selectedId);
  const isEmpty = foldersHere.length === 0 && documentsHere.length === 0;

  const shiftRef = useRef(false);
  // Orden visible para la selección por rango (Shift).
  const orderedKeys = useMemo(
    () => [
      ...foldersHere.map((folder) => `folder-${folder.id}`),
      ...documentsHere.map((doc) => `doc-${doc.id}`),
    ],
    [foldersHere, documentsHere],
  );

  const selection: ExplorerSelection = useMemo(
    () => ({
      documents: documents.filter((doc) => selected.has(`doc-${doc.id}`)),
      folders: folders.filter((folder) => selected.has(`folder-${folder.id}`)),
    }),
    [documents, folders, selected],
  );

  const toggleKey = useCallback(
    (key: string, shiftKey: boolean) => {
      const index = orderedKeys.indexOf(key);
      setSelected((prev) => {
        const next = new Set(prev);
        const last = lastToggledRef.current;
        if (shiftKey && last != null && index >= 0) {
          const from = Math.min(last, index);
          const to = Math.max(last, index);
          const turnOn = !prev.has(key);
          for (let i = from; i <= to; i += 1) {
            if (turnOn) next.add(orderedKeys[i]);
            else next.delete(orderedKeys[i]);
          }
        } else if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      if (index >= 0) lastToggledRef.current = index;
    },
    [orderedKeys],
  );

  const selectedCount = selection.documents.length + selection.folders.length;
  const allSelected = orderedKeys.length > 0 && selectedCount === orderedKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(orderedKeys));
    lastToggledRef.current = null;
  };

  const crumb = (label: string, active: boolean, onClick: () => void) => (
    <Typography
      component="button"
      onClick={onClick}
      sx={{
        border: "none",
        background: "none",
        cursor: "pointer",
        font: "inherit",
        fontSize: "0.8125rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        color: active ? colors.text : colors.accent,
      }}
    >
      {label}
    </Typography>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        flex: { md: 1 },
        minHeight: 0,
        height: { md: "100%" },
        width: "100%",
      }}
    >
      {isDesktop && (
        <Box
          sx={{
            width: 264,
            flexShrink: 0,
            borderRight: borders.hairline,
            overflowY: "auto",
            py: 1,
            px: 1,
          }}
        >
          {tree}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            px: { xs: 1.5, md: 2 },
            py: 1,
            borderBottom: borders.hairline,
          }}
        >
          {!isDesktop && (
            <IconButton size="small" aria-label="Abrir carpetas" onClick={() => setTreeOpen(true)}>
              <IconMenu2 size={18} />
            </IconButton>
          )}
          {selectable && orderedKeys.length > 0 && (
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              inputProps={{ "aria-label": "Seleccionar todo" }}
              sx={{ p: 0.25, ml: -0.5 }}
            />
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1, minWidth: 0, overflowX: "auto" }}>
            {crumb(rootLabel, selectedId == null, () => select(null))}
            {trail.map((folder) => (
              <React.Fragment key={folder.id}>
                <IconChevronRight size={14} color={colors.textMuted} style={{ flexShrink: 0 }} />
                {crumb(folder.name, folder.id === selectedId, () => select(folder.id))}
              </React.Fragment>
            ))}
          </Box>
          {selectedCount === 0 && folderActions?.(selectedId)}
        </Box>

        {selectable && selectedCount > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              px: { xs: 1.5, md: 2 },
              py: 0.75,
              borderBottom: borders.hairline,
              backgroundColor: colors.accentSoft,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", color: colors.accent }}>
              {selectedCount} seleccionado{selectedCount === 1 ? "" : "s"}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 0 }} />
            {renderSelectionActions?.(selection, clearSelection)}
            <Tooltip title="Limpiar selección">
              <IconButton size="small" aria-label="Limpiar selección" onClick={clearSelection}>
                <IconX size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box sx={{ px: { xs: 1, md: 1.5 }, py: 1, flex: { md: 1 }, minHeight: 0, overflow: { md: "auto" } }}>
          {foldersHere.map((folder) => (
            <Box
              key={`folder-${folder.id}`}
              sx={{ ...contentRowSx, cursor: "pointer", "&:hover": { backgroundColor: colors.hoverSoft } }}
              onClick={() => select(folder.id)}
            >
              {selectable && (
                <Checkbox
                  size="small"
                  checked={selected.has(`folder-${folder.id}`)}
                  onMouseDown={(event) => {
                    shiftRef.current = event.shiftKey;
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => toggleKey(`folder-${folder.id}`, shiftRef.current)}
                  inputProps={{ "aria-label": `Seleccionar carpeta ${folder.name}` }}
                  sx={{ p: 0.25, ml: -0.5 }}
                />
              )}
              <IconFolder size={20} color={colors.accent} />
              <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: "0.9rem" }} noWrap>
                {folder.name}
              </Typography>
              <IconChevronRight size={16} color={colors.textMuted} />
              {onDeleteFolder && (
                <Tooltip title="Eliminar carpeta">
                  <IconButton
                    size="small"
                    aria-label={`Eliminar carpeta ${folder.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteFolder(folder);
                    }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}

          {documentsHere.map((doc) => (
            <Box
              key={`file-${doc.id}`}
              sx={{
                ...contentRowSx,
                ...(selectable
                  ? {
                      cursor: "pointer",
                      "&:hover": { backgroundColor: colors.hoverSoft },
                      ...(selected.has(`doc-${doc.id}`) && { backgroundColor: colors.accentSoft }),
                    }
                  : {}),
              }}
              onClick={selectable ? (event) => toggleKey(`doc-${doc.id}`, event.shiftKey) : undefined}
            >
              {selectable && (
                <Checkbox
                  size="small"
                  checked={selected.has(`doc-${doc.id}`)}
                  onMouseDown={(event) => {
                    shiftRef.current = event.shiftKey;
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => toggleKey(`doc-${doc.id}`, shiftRef.current)}
                  inputProps={{ "aria-label": `Seleccionar ${doc.name}` }}
                  sx={{ p: 0.25, ml: -0.5 }}
                />
              )}
              <IconFile size={20} color={colors.textMuted} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {doc.name}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  {formatBytes(doc.size)}
                </Typography>
              </Box>
              {onEdit && isOfficeDocument(doc.name) && (
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    aria-label={`Editar ${doc.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(doc);
                    }}
                  >
                    <IconPencil size={16} />
                  </IconButton>
                </Tooltip>
              )}
              {onPreview && (
                <Tooltip title="Vista previa">
                  <IconButton
                    size="small"
                    aria-label={`Vista previa de ${doc.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onPreview(doc);
                    }}
                  >
                    <IconEye size={16} />
                  </IconButton>
                </Tooltip>
              )}
              {onDownload && (
                <Tooltip title="Descargar">
                  <IconButton
                    size="small"
                    aria-label={`Descargar ${doc.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDownload(doc);
                    }}
                  >
                    <IconDownload size={16} />
                  </IconButton>
                </Tooltip>
              )}
              {onDeleteDocument && (
                <Tooltip title="Eliminar archivo">
                  <IconButton
                    size="small"
                    aria-label={`Eliminar archivo ${doc.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteDocument(doc);
                    }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}

          {isEmpty && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                py: 4,
                color: colors.textMuted,
              }}
            >
              <IconFolderOff size={30} />
              <Typography variant="body2">
                {selectedId == null ? "Sin documentos" : "Esta carpeta está vacía"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {!isDesktop && (
        <Drawer
          anchor="left"
          open={treeOpen}
          onClose={() => setTreeOpen(false)}
          PaperProps={{ sx: { width: 280, backgroundColor: colors.surface } }}
        >
          <Box sx={{ py: 1, px: 1 }}>{tree}</Box>
        </Drawer>
      )}
    </Box>
  );
};

export default DocumentExplorer;
