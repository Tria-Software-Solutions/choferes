import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import { IconFolder, IconInbox } from "@tabler/icons-react";
import { hasManagementRole } from "@choferes/shared";
import { useAuthContext } from "../../../context/AuthContext";
import SegmentedToggle from "../../../components/SegmentedToggle/SegmentedToggle.component";
import DocumentExplorer from "../../../components/DocumentExplorer/DocumentExplorer.component";
import DocumentPreview, {
  triggerDownload,
} from "../../../components/DocumentPreview/DocumentPreview.component";
import type { DocumentDTO, DocumentScope } from "../../../services/documentService";
import { downloadMyDocument, getMyDocuments } from "../../../services/documentService";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import SectionHeader from "../../EmployeeDetail/components/SectionHeader";
import {
  cardStackStyles,
  emptyStateBoxStyles,
  fillSectionPaperStyles,
} from "../../EmployeeDetail/styles";

// Los dos ámbitos disponibles en Mi Panel.
type ScopeKey = "shared" | "personal";

// "Documentos": lo compartido con toda la empresa y lo que administración subió
// a la ficha del empleado. Solo lectura y descarga.
export const DocumentsTab: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useAppNotifications();
  const { currentUser } = useAuthContext();
  // Vista de empleado (Supervisor/Chofer/Chofer Coordinador/Recepcionista):
  // una sola sección con dos tabs. Solo los roles de gestión (Gerencia,
  // Administrativo, SysAdmin) ven los dos ámbitos apilados, porque ahí la
  // distinción es "lo de la empresa" vs "lo de este empleado".
  const isEmployeeView = !hasManagementRole(currentUser);
  const [activeScope, setActiveScope] = useState<ScopeKey>("shared");
  const [previewTarget, setPreviewTarget] = useState<DocumentDTO | null>(null);
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
        const full = await downloadMyDocument(doc.id);
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
          {isEmployeeView ? (
            <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
              <SectionHeader
                icon={<IconFolder size={20} stroke={1.5} />}
                title="Documentos"
                description="Compartidos por la empresa o subidos a tu expediente."
              />
              <Box sx={{ mb: 1.5 }}>
                <SegmentedToggle<ScopeKey>
                  value={activeScope}
                  onChange={setActiveScope}
                  ariaLabel="Ámbito de documentos"
                  options={[
                    { value: "shared", label: "Documentos compartidos" },
                    { value: "personal", label: "Tus documentos" },
                  ]}
                />
              </Box>
              {data && (
                <DocumentExplorer
                  key={activeScope}
                  folders={activeScope === "shared" ? data.shared.folders : data.personal.folders}
                  documents={activeScope === "shared" ? data.shared.documents : data.personal.documents}
                  rootLabel={activeScope === "shared" ? "Documentos compartidos" : "Tus documentos"}
                  onDownload={handleDownload}
                  onPreview={setPreviewTarget}
                />
              )}
            </Paper>
          ) : (
            <>
              <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
                <SectionHeader
                  icon={<IconFolder size={20} stroke={1.5} />}
                  title="Documentos compartidos"
                  description="Material que la empresa pone a disposición de todos."
                />
                {data && (
                  <DocumentExplorer
                    folders={data.shared.folders}
                    documents={data.shared.documents}
                    rootLabel="Documentos compartidos"
                    onDownload={handleDownload}
                    onPreview={setPreviewTarget}
                  />
                )}
              </Paper>

              <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
                <SectionHeader
                  icon={<IconFolder size={20} stroke={1.5} />}
                  title="Mis documentos"
                  description="Archivos que administración subió a tu expediente."
                />
                {data && (
                  <DocumentExplorer
                    folders={data.personal.folders}
                    documents={data.personal.documents}
                    rootLabel="Mis documentos"
                    onDownload={handleDownload}
                    onPreview={setPreviewTarget}
                  />
                )}
              </Paper>
            </>
          )}
        </>
      )}

      <DocumentPreview
        open={previewTarget != null}
        doc={previewTarget}
        onClose={() => setPreviewTarget(null)}
        fetchDocument={downloadMyDocument}
      />
    </Box>
  );
};

export default DocumentsTab;
