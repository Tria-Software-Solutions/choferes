import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconChevronRight,
  IconDownload,
  IconEye,
  IconFile,
  IconFolder,
  IconFolderPlus,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useAuthContext } from "../../context/AuthContext";
import { PERMISSION_CODES } from "../../constants/permissions.constants";
import APPBAR_MENU from "../../constants/appbar.constants";
import NavIcon from "../../components/NavIcon/NavIcon.component";
import EmployeeAvatar from "../../components/EmployeeAvatar/EmployeeAvatar.component";
import PlaceholderSelect from "../../components/PlaceholderSelect/PlaceholderSelect.component";
import DocumentPreview, {
  formatBytes,
  triggerDownload,
} from "../../components/DocumentPreview/DocumentPreview.component";
import { EmptyState, PageBody, PageCard, PageContainer, PageHeader } from "../../components/Layout";
import { useAppNotifications } from "../../components/Snackbar/Snackbar.component";
import * as EmployeeService from "../../services/employeeService";
import * as DocumentService from "../../services/documentService";
import type { DocumentDTO, DocumentFolderDTO, DocumentScope } from "../../services/documentService";
import type { Employee } from "../../models/Employee";

const SHARED_SCOPE = "shared";
type ScopeValue = typeof SHARED_SCOPE | number;

const employeeLabel = (employee: Employee) =>
  `${employee.firstName} ${employee.lastName}`.trim();

// Página de Documentos: administración crea carpetas y sube archivos en el
// ámbito compartido o en el de un empleado. Los empleados ven esos documentos
// desde su Mi Panel (pestaña Documentos), no desde aquí.
const DocumentsPage: React.FC = () => {
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const canManage = userPermissions.includes(PERMISSION_CODES.MANAGE_DOCUMENTS);

  const [employees, setEmployees] = useState<Employee[]>([]);
  // "shared" = ámbito global; un número = carpeta/archivos de ese empleado.
  const [scopeId, setScopeId] = useState<number | "shared">("shared");
  const [scope, setScope] = useState<DocumentScope>({ folders: [], documents: [] });
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<
    { type: "folder" | "file"; id: number; name: string } | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<DocumentDTO | null>(null);

  const ownerEmployeeId = scopeId === "shared" ? null : scopeId;

  // Cada empleado se identifica con su foto/avatar, tanto en la lista de
  // opciones como en el valor seleccionado del campo.
  const employeeOption = (employee: Employee, size: number) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <EmployeeAvatar employee={employee} size={size} />
      <Typography component="span" sx={{ fontSize: "0.875rem" }} noWrap>
        {employeeLabel(employee)}
      </Typography>
    </Box>
  );

  const scopeOptionLabel = (value: ScopeValue): React.ReactNode => {
    if (value === SHARED_SCOPE) return "Compartido (toda la empresa)";
    const employee = employees.find((item) => item.id === value);
    return employee ? employeeOption(employee, 22) : "Empleado";
  };

  const scopeLabel = useMemo(() => {
    if (ownerEmployeeId == null) return "Compartido (toda la empresa)";
    const employee = employees.find((item) => item.id === ownerEmployeeId);
    return employee ? employeeLabel(employee) : "Empleado";
  }, [ownerEmployeeId, employees]);

  useEffect(() => {
    let cancelled = false;
    EmployeeService.getEmployees()
      .then((data: Employee[]) => {
        if (!cancelled) setEmployees(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async (owner: number | null) => {
    setLoading(true);
    setError(null);
    try {
      setScope(await DocumentService.getDocuments(owner));
    } catch {
      setError("No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentFolderId(null);
    void load(ownerEmployeeId);
  }, [ownerEmployeeId, load]);

  const childrenFolders = scope.folders.filter((folder) => (folder.parentId ?? null) === currentFolderId);
  const currentDocuments = scope.documents.filter((doc) => (doc.folderId ?? null) === currentFolderId);

  // Ruta desde la raíz hasta la carpeta actual (para la miga de pan).
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

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setCreatingFolder(true);
    try {
      await DocumentService.createDocumentFolder({
        name: folderName.trim(),
        parentId: currentFolderId,
        ownerEmployeeId,
      });
      setFolderName("");
      setFolderDialogOpen(false);
      await load(ownerEmployeeId);
      showNotification("Carpeta creada", { severity: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la carpeta";
      showNotification(message, { severity: "error" });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingFile(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
        reader.readAsDataURL(file);
      });
      await DocumentService.uploadDocument({
        name: file.name,
        folderId: currentFolderId,
        ownerEmployeeId,
        mimeType: file.type || null,
        size: file.size,
        data,
      });
      await load(ownerEmployeeId);
      showNotification("Archivo subido", { severity: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir el archivo";
      showNotification(message, { severity: "error" });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownload = async (doc: DocumentDTO) => {
    try {
      const full = await DocumentService.downloadDocument(doc.id);
      triggerDownload(full.data, full.name);
    } catch {
      showNotification("No se pudo descargar el archivo", { severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "folder") {
        await DocumentService.deleteDocumentFolder(deleteTarget.id);
      } else {
        await DocumentService.deleteDocument(deleteTarget.id);
      }
      setDeleteTarget(null);
      await load(ownerEmployeeId);
      showNotification("Elemento eliminado", { severity: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar";
      showNotification(message, { severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const rowSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 2.5,
    py: 1.25,
    borderBottom: borders.hairline,
    "&:last-of-type": { borderBottom: "none" },
  } as const;

  return (
    <PageContainer>
      <PageCard>
        <PageHeader
          icon={<NavIcon label={APPBAR_MENU.DOCUMENTS} />}
          title="Documentos"
          mobileTitle="Documentos"
          subtitle="Carpetas y archivos de la empresa y de cada empleado."
          toolbar={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Box sx={{ width: { xs: "100%", sm: 260 }, flexShrink: 0 }}>
                <PlaceholderSelect<ScopeValue>
                  placeholder="Ámbito de documentos"
                  icon={<IconFolder size={18} />}
                  value={scopeId}
                  onChange={(event) =>
                    setScopeId(
                      event.target.value === SHARED_SCOPE ? "shared" : Number(event.target.value),
                    )
                  }
                  formatValue={scopeOptionLabel}
                >
                  <MenuItem value={SHARED_SCOPE}>Compartido (toda la empresa)</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employeeOption(employee, 26)}
                    </MenuItem>
                  ))}
                </PlaceholderSelect>
              </Box>

              {/* Miga de pan del ámbito actual + carpeta abierta */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                <Typography
                  component="button"
                  onClick={() => setCurrentFolderId(null)}
                  sx={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: currentFolderId == null ? colors.text : colors.accent,
                  }}
                >
                  {scopeLabel}
                </Typography>
                {breadcrumb.map((folder) => (
                  <React.Fragment key={folder.id}>
                    <IconChevronRight size={14} color={colors.textMuted} />
                    <Typography
                      component="button"
                      onClick={() => setCurrentFolderId(folder.id)}
                      sx={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        font: "inherit",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: folder.id === currentFolderId ? colors.text : colors.accent,
                      }}
                    >
                      {folder.name}
                    </Typography>
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          }
          toolbarEnd={
            canManage ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<IconFolderPlus size={16} />}
                  onClick={() => setFolderDialogOpen(true)}
                >
                  Nueva carpeta
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconUpload size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? "Subiendo…" : "Subir archivo"}
                </Button>
                <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
              </>
            ) : undefined
          }
        />

        <PageBody scroll>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Cargando documentos…
              </Typography>
            </Box>
          ) : error ? (
            <EmptyState
              icon={<IconFolder />}
              title="Algo salió mal"
              description={error}
              action={
                <Button variant="outlined" onClick={() => void load(ownerEmployeeId)}>
                  Reintentar
                </Button>
              }
            />
          ) : childrenFolders.length === 0 && currentDocuments.length === 0 ? (
            <EmptyState
              icon={<IconFolder />}
              title="Sin documentos"
              description={
                canManage
                  ? "Crea una carpeta o sube un archivo para empezar."
                  : "Todavía no hay documentos en este ámbito."
              }
            />
          ) : (
            <Box>
              {childrenFolders.map((folder) => (
                <Box key={`folder-${folder.id}`} sx={rowSx}>
                  <IconFolder size={20} color={colors.accent} />
                  <Typography
                    onClick={() => setCurrentFolderId(folder.id)}
                    sx={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
                  >
                    {folder.name}
                  </Typography>
                  {canManage && (
                    <Tooltip title="Eliminar carpeta">
                      <IconButton
                        size="small"
                        aria-label={`Eliminar carpeta ${folder.name}`}
                        onClick={() => setDeleteTarget({ type: "folder", id: folder.id, name: folder.name })}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}

              {currentDocuments.map((doc) => (
                <Box key={`file-${doc.id}`} sx={rowSx}>
                  <IconFile size={20} color={colors.textMuted} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }} noWrap>
                      {doc.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>
                      {formatBytes(doc.size)}
                    </Typography>
                  </Box>
                  <Tooltip title="Vista previa">
                    <IconButton
                      size="small"
                      aria-label={`Vista previa de ${doc.name}`}
                      onClick={() => setPreviewTarget(doc)}
                    >
                      <IconEye size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Descargar">
                    <IconButton
                      size="small"
                      aria-label={`Descargar ${doc.name}`}
                      onClick={() => void handleDownload(doc)}
                    >
                      <IconDownload size={16} />
                    </IconButton>
                  </Tooltip>
                  {canManage && (
                    <Tooltip title="Eliminar archivo">
                      <IconButton
                        size="small"
                        aria-label={`Eliminar archivo ${doc.name}`}
                        onClick={() => setDeleteTarget({ type: "file", id: doc.id, name: doc.name })}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </PageBody>
      </PageCard>

      {/* Diálogo: nueva carpeta */}
      <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Nueva carpeta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nombre de la carpeta"
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleCreateFolder();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCreateFolder()}
            disabled={creatingFolder || !folderName.trim()}
            sx={{ textTransform: "none" }}
          >
            {creatingFolder ? "Creando…" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vista previa de un archivo */}
      <DocumentPreview
        open={previewTarget != null}
        doc={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      {/* Confirmación: eliminar carpeta/archivo */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Eliminar
          <IconButton size="small" aria-label="Cerrar" onClick={() => setDeleteTarget(null)}>
            <IconX size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {deleteTarget?.type === "folder"
              ? `¿Eliminar la carpeta "${deleteTarget.name}" y todo su contenido?`
              : `¿Eliminar el archivo "${deleteTarget?.name}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDelete()}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DocumentsPage;
