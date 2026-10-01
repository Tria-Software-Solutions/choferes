import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import {
  IconChevronRight,
  IconDownload,
  IconFile,
  IconFolder,
  IconFolderOff,
  IconInbox,
} from "@tabler/icons-react";
import type { DocumentDTO, DocumentFolderDTO, DocumentScope } from "../../../services/documentService";
import { downloadDocument, getMyDocuments } from "../../../services/documentService";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import SectionHeader from "../../EmployeeDetail/components/SectionHeader";
import {
  cardStackStyles,
  emptyStateBoxStyles,
  fillSectionPaperStyles,
} from "../../EmployeeDetail/styles";

const formatBytes = (bytes: number): string => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Descarga una data URL base64 validando el esquema (evita `javascript:`).
const triggerDownload = (url: string | undefined, name: string) => {
  if (!url || !/^data:[\w.+-]+\/[\w.+-]+;base64,/.test(url)) return;
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const rowSx = (borders: { hairline: string }) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  px: 1.5,
  py: 1,
  borderRadius: "10px",
  border: borders.hairline,
  mb: 0.75,
});

interface ScopeSectionProps {
  scope: DocumentScope;
  onDownload: (doc: DocumentDTO) => void;
}

// Un ámbito (compartido o propio) con navegación por carpetas y descarga.
const ScopeSection: React.FC<ScopeSectionProps> = ({ scope, onDownload }) => {
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentFolderId(null);
  }, [scope]);

  const childrenFolders = scope.folders.filter((folder) => (folder.parentId ?? null) === currentFolderId);
  const documents = scope.documents.filter((doc) => (doc.folderId ?? null) === currentFolderId);

  const breadcrumb = useMemo(() => {
    const byId = new Map(scope.folders.map((folder) => [folder.id, folder]));
    const trail: DocumentFolderDTO[] = [];
    let cursor = currentFolderId;
    while (cursor != null) {
      const folder = byId.get(cursor);
      if (!folder) break;
      trail.unshift(folder);
      cursor = folder.parentId ?? null;
    }
    return trail;
  }, [currentFolderId, scope.folders]);

  if (scope.folders.length === 0 && scope.documents.length === 0) {
    return (
      <Box sx={emptyStateBoxStyles(theme)}>
        <IconInbox size={34} />
        <Typography variant="body2">No hay documentos en esta sección</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {currentFolderId != null && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
          <Button size="small" onClick={() => setCurrentFolderId(null)} sx={{ textTransform: "none" }}>
            Inicio
          </Button>
          {breadcrumb.map((folder) => (
            <React.Fragment key={folder.id}>
              <IconChevronRight size={14} color={colors.textMuted} />
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>{folder.name}</Typography>
            </React.Fragment>
          ))}
        </Box>
      )}

      {childrenFolders.map((folder) => (
        <Box key={`folder-${folder.id}`} sx={rowSx(borders)}>
          <IconFolder size={18} color={colors.accent} />
          <Typography
            onClick={() => setCurrentFolderId(folder.id)}
            sx={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
          >
            {folder.name}
          </Typography>
          <IconChevronRight size={16} color={colors.textMuted} />
        </Box>
      ))}

      {documents.map((doc) => (
        <Box key={`file-${doc.id}`} sx={rowSx(borders)}>
          <IconFile size={18} color={colors.textMuted} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }} noWrap>
              {doc.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textMuted }}>
              {formatBytes(doc.size)}
            </Typography>
          </Box>
          <Tooltip title="Descargar">
            <IconButton size="small" aria-label={`Descargar ${doc.name}`} onClick={() => onDownload(doc)}>
              <IconDownload size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ))}

      {childrenFolders.length === 0 && documents.length === 0 && (
        <Box sx={{ px: 1.5, py: 2, textAlign: "center" }}>
          <IconFolderOff size={26} color={colors.textMuted} />
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.5 }}>
            Esta carpeta está vacía
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// "Documentos": lo compartido con toda la empresa y lo que administración subió
// a la ficha del empleado. Solo lectura y descarga.
export const DocumentsTab: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useAppNotifications();
  const [data, setData] = useState<{ shared: DocumentScope; personal: DocumentScope } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await getMyDocuments());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDownload = useCallback(
    async (doc: DocumentDTO) => {
      try {
        const full = await downloadDocument(doc.id);
        triggerDownload(full.data, full.name);
      } catch {
        showNotification("No se pudo descargar el archivo", { severity: "error" });
      }
    },
    [showNotification],
  );

  return (
    <Box sx={cardStackStyles}>
      {loading ? (
        <Typography variant="body2" sx={{ color: theme.tokens.colors.textMuted }}>
          Cargando documentos…
        </Typography>
      ) : error ? (
        <Box sx={emptyStateBoxStyles(theme)}>
          <IconInbox size={34} />
          <Typography variant="body2">No se pudieron cargar tus documentos</Typography>
          <Button variant="outlined" onClick={() => void load()}>
            Reintentar
          </Button>
        </Box>
      ) : (
        <>
          <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
            <SectionHeader
              icon={<IconFolder size={20} stroke={1.5} />}
              title="Documentos compartidos"
              description="Material que la empresa pone a disposición de todos."
            />
            {data && <ScopeSection scope={data.shared} onDownload={handleDownload} />}
          </Paper>

          <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
            <SectionHeader
              icon={<IconFolder size={20} stroke={1.5} />}
              title="Mis documentos"
              description="Archivos que administración subió a tu expediente."
            />
            {data && <ScopeSection scope={data.personal} onDownload={handleDownload} />}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DocumentsTab;
