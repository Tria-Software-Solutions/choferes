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
  Typography,
} from "@mui/material";
import {
  IconDownload,
  IconFolder,
  IconFolderPlus,
  IconFolderSymlink,
  IconShare,
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
import DocumentExplorer from "../../components/DocumentExplorer/DocumentExplorer.component";
import type { ExplorerSelection } from "../../components/DocumentExplorer/DocumentExplorer.component";
import DocumentPreview, {
  triggerBlobDownload,
  triggerDownload,
} from "../../components/DocumentPreview/DocumentPreview.component";
import OfficeEditor from "../../components/OfficeEditor/OfficeEditor.component";
import { EmptyState, PageBody, PageCard, PageContainer, PageHeader } from "../../components/Layout";
import { useAppNotifications } from "../../components/Snackbar/Snackbar.component";
import * as EmployeeService from "../../services/employeeService";
import * as DocumentService from "../../services/documentService";
import type { DocumentDTO, DocumentScope } from "../../services/documentService";
import type { Employee } from "../../models/Employee";
import ShareDialog from "./components/ShareDialog.component";
import MoveDialog from "./components/MoveDialog.component";

const SHARED_SCOPE = "shared";
const PERSONAL_SCOPE = "personal";
type ScopeValue = typeof SHARED_SCOPE | typeof PERSONAL_SCOPE | number;

const employeeLabel = (employee: Employee) =>
  `${employee.firstName} ${employee.lastName}`.trim();

// Página de Documentos: administración crea carpetas y sube archivos en el
// ámbito compartido, en el privado del propio usuario ("Solo para mí") o en el
// de un empleado. Los empleados ven esos documentos desde su Mi Panel (pestaña
// Documentos), no desde aquí.
const DocumentsPage: React.FC = () => {
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  const canManage = userPermissions.includes(PERMISSION_CODES.MANAGE_DOCUMENTS);

  const [employees, setEmployees] = useState<Employee[]>([]);
  // "shared" = ámbito global; "personal" = mis documentos privados (ligados a mi
  // usuario, no a una ficha de Planilla); un número = carpeta/archivos de ese
  // empleado. Apertura por defecto en "Compartido (toda la empresa)".
  const [scopeId, setScopeId] = useState<ScopeValue>(SHARED_SCOPE);
  const [scope, setScope] = useState<DocumentScope>({ folders: [], documents: [] });
  const [folderParentId, setFolderParentId] = useState<number | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<number | null>(null);
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
  // Archivo abierto en el editor de oficina (Word/Excel/PowerPoint).
  const [editTarget, setEditTarget] = useState<DocumentDTO | null>(null);

  // Acciones masivas (selección múltiple). Se guarda también el "limpiar
  // selección" del explorador para resetearlo tras completar la acción.
  const [shareState, setShareState] = useState<{
    documents: DocumentDTO[];
    clear: () => void;
  } | null>(null);
  const [moveState, setMoveState] = useState<{
    selection: ExplorerSelection;
    clear: () => void;
  } | null>(null);
  const [bulkDeleteState, setBulkDeleteState] = useState<{
    selection: ExplorerSelection;
    clear: () => void;
  } | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const isPersonal = scopeId === PERSONAL_SCOPE;
  // El ámbito personal se resuelve en el servidor a partir del usuario del token.
  const ownerEmployeeId =
    scopeId === SHARED_SCOPE || isPersonal ? null : scopeId;

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
    if (value === PERSONAL_SCOPE) return "Solo para mí";
    const employee = employees.find((item) => item.id === value);
    return employee ? employeeOption(employee, 22) : "Empleado";
  };

  const scopeLabel = useMemo(() => {
    if (scopeId === PERSONAL_SCOPE) return "Solo para mí";
    if (ownerEmployeeId == null) return "Compartido (toda la empresa)";
    const employee = employees.find((item) => item.id === ownerEmployeeId);
    return employee ? employeeLabel(employee) : "Empleado";
  }, [scopeId, ownerEmployeeId, employees]);

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setScope(
        isPersonal
          ? await DocumentService.getPersonalDocuments()
          : await DocumentService.getDocuments(ownerEmployeeId),
      );
    } catch {
      setError("No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
    }
  }, [isPersonal, ownerEmployeeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setCreatingFolder(true);
    try {
      await DocumentService.createDocumentFolder({
        name: folderName.trim(),
        parentId: folderParentId,
        personal: isPersonal,
        ownerEmployeeId: isPersonal ? undefined : ownerEmployeeId,
      });
      setFolderName("");
      setFolderDialogOpen(false);
      await load();
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
        folderId: uploadFolderId,
        personal: isPersonal,
        ownerEmployeeId: isPersonal ? undefined : ownerEmployeeId,
        mimeType: file.type || null,
        size: file.size,
        data,
      });
      await load();
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
      await load();
      showNotification("Elemento eliminado", { severity: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar";
      showNotification(message, { severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDownload = async (selection: ExplorerSelection) => {
    const files = selection.documents;
    if (files.length === 0) return;
    setBulkBusy(true);
    try {
      if (files.length === 1) {
        const full = await DocumentService.downloadDocument(files[0].id);
        triggerDownload(full.data, full.name);
      } else {
        const blob = await DocumentService.buildDocumentsZip(files);
        triggerBlobDownload(blob, `documentos-${files.length}.zip`);
      }
    } catch {
      showNotification("No se pudieron descargar los archivos", { severity: "error" });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkDeleteState) return;
    setBulkBusy(true);
    try {
      const { selection, clear } = bulkDeleteState;
      await Promise.all([
        ...selection.documents.map((doc) => DocumentService.deleteDocument(doc.id)),
        ...selection.folders.map((folder) => DocumentService.deleteDocumentFolder(folder.id)),
      ]);
      setBulkDeleteState(null);
      clear();
      await load();
      showNotification("Elementos eliminados", { severity: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron eliminar";
      showNotification(message, { severity: "error" });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleMove = async (targetFolderId: number | null) => {
    if (!moveState) return;
    setBulkBusy(true);
    try {
      const { selection, clear } = moveState;
      await DocumentService.moveDocumentItems({
        documentIds: selection.documents.map((doc) => doc.id),
        folderIds: selection.folders.map((folder) => folder.id),
        targetFolderId,
        personal: isPersonal,
        ownerEmployeeId: isPersonal ? undefined : ownerEmployeeId,
      });
      setMoveState(null);
      clear();
      await load();
      showNotification("Elementos movidos", { severity: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron mover";
      showNotification(message, { severity: "error" });
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <PageContainer>
      <PageCard>
        <PageHeader
          icon={<NavIcon label={APPBAR_MENU.DOCUMENTS} />}
          title="Documentos"
          mobileTitle="Documentos"
          subtitle="Carpetas y archivos de la empresa y de cada empleado."
          toolbar={
            <Box sx={{ width: { xs: "100%", sm: 260 }, flexShrink: 0 }}>
              <PlaceholderSelect<ScopeValue>
                placeholder="Ámbito de documentos"
                value={scopeId}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === SHARED_SCOPE) setScopeId(SHARED_SCOPE);
                  else if (value === PERSONAL_SCOPE) setScopeId(PERSONAL_SCOPE);
                  else setScopeId(Number(value));
                }}
                formatValue={scopeOptionLabel}
              >
                <MenuItem value={PERSONAL_SCOPE}>Solo para mí</MenuItem>
                <MenuItem value={SHARED_SCOPE}>Compartido (toda la empresa)</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employeeOption(employee, 26)}
                  </MenuItem>
                ))}
              </PlaceholderSelect>
            </Box>
          }
        />

        <PageBody>
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
                <Button variant="outlined" onClick={() => void load()}>
                  Reintentar
                </Button>
              }
            />
          ) : (
            <DocumentExplorer
              key={String(scopeId)}
              folders={scope.folders}
              documents={scope.documents}
              rootLabel={scopeLabel}
              onPreview={(doc) => setPreviewTarget(doc)}
              onDownload={(doc) => void handleDownload(doc)}
              // El editor de oficina solo está para los roles con `documents:manage`
              // (Gerencia/Administrativo/SysAdmin).
              onEdit={canManage ? (doc) => setEditTarget(doc) : undefined}
              onDeleteFolder={
                canManage
                  ? (folder) => setDeleteTarget({ type: "folder", id: folder.id, name: folder.name })
                  : undefined
              }
              onDeleteDocument={
                canManage
                  ? (doc) => setDeleteTarget({ type: "file", id: doc.id, name: doc.name })
                  : undefined
              }
              folderActions={
                canManage
                  ? (folderId) => (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<IconFolderPlus size={16} />}
                          onClick={() => {
                            setFolderParentId(folderId);
                            setFolderDialogOpen(true);
                          }}
                        >
                          Nueva carpeta
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<IconUpload size={16} />}
                          onClick={() => {
                            setUploadFolderId(folderId);
                            fileInputRef.current?.click();
                          }}
                          disabled={uploadingFile}
                        >
                          {uploadingFile ? "Subiendo…" : "Subir archivo"}
                        </Button>
                        <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
                      </>
                    )
                  : undefined
              }
              selectable
              renderSelectionActions={(selection, clearSelection) => (
                <>
                  <Button
                    size="small"
                    startIcon={<IconShare size={16} />}
                    disabled={selection.documents.length === 0 || bulkBusy}
                    onClick={() =>
                      setShareState({ documents: selection.documents, clear: clearSelection })
                    }
                  >
                    Compartir
                  </Button>
                  <Button
                    size="small"
                    startIcon={<IconDownload size={16} />}
                    disabled={selection.documents.length === 0 || bulkBusy}
                    onClick={() => void handleBulkDownload(selection)}
                  >
                    Descargar
                  </Button>
                  {canManage && (
                    <>
                      <Button
                        size="small"
                        startIcon={<IconFolderSymlink size={16} />}
                        disabled={bulkBusy}
                        onClick={() => setMoveState({ selection, clear: clearSelection })}
                      >
                        Mover
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<IconTrash size={16} />}
                        disabled={bulkBusy}
                        onClick={() => setBulkDeleteState({ selection, clear: clearSelection })}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </>
              )}
            />
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

      {/* Editor de oficina (Word/Excel/PowerPoint) */}
      <OfficeEditor
        open={editTarget != null}
        doc={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => void load()}
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

      {/* Compartir selección múltiple */}
      <ShareDialog
        open={shareState != null}
        documents={shareState?.documents ?? []}
        employees={employees}
        onClose={() => setShareState(null)}
        onShared={() => {
          shareState?.clear();
          void load();
        }}
      />

      {/* Mover selección múltiple */}
      <MoveDialog
        open={moveState != null}
        folders={scope.folders}
        selection={moveState?.selection ?? { documents: [], folders: [] }}
        onClose={() => setMoveState(null)}
        onMoved={(targetFolderId) => void handleMove(targetFolderId)}
      />

      {/* Confirmación: eliminar selección múltiple */}
      <Dialog
        open={bulkDeleteState != null}
        onClose={() => setBulkDeleteState(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Eliminar</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {bulkDeleteState
              ? `¿Eliminar ${
                  bulkDeleteState.selection.documents.length + bulkDeleteState.selection.folders.length
                } elemento(s)? Las carpetas se eliminan con todo su contenido.`
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteState(null)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleBulkDelete()}
            disabled={bulkBusy}
            sx={{ textTransform: "none" }}
          >
            {bulkBusy ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DocumentsPage;
