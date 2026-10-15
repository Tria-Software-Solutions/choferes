import JSZip from "jszip";
import api, { invalidateCache } from "./api";

// Nivel de acceso concedido a un destinatario de un documento compartido.
export type SharePermission = "view" | "comment" | "edit";

export interface ShareRecipient {
  type: "employee" | "user";
  id: number;
}

export interface DocumentShareDTO {
  id: number;
  documentId: number;
  employeeId: number | null;
  userId: number | null;
  permission: SharePermission;
  recipientType: "employee" | "user";
  recipientName: string | null;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Documentos: carpetas y archivos. El binario viaja como data URL base64, así
// que se envían/reciben objetos JSON normales.
export interface DocumentFolderDTO {
  id: number;
  name: string;
  parentId: number | null;
  ownerEmployeeId: number | null;
  /** Usuario dueño del ámbito privado ("Solo para mí"); null salvo ese caso. */
  ownerUserId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentDTO {
  id: number;
  folderId: number | null;
  ownerEmployeeId: number | null;
  /** Usuario dueño del ámbito privado ("Solo para mí"); null salvo ese caso. */
  ownerUserId?: number | null;
  name: string;
  mimeType: string | null;
  size: number;
  createdAt?: string;
  updatedAt?: string;
  /** Solo en la descarga de un archivo concreto. */
  data?: string;
  /** Permiso con el que me compartieron este archivo (vista "Tus documentos"). */
  sharePermission?: SharePermission;
}

export interface DocumentScope {
  folders: DocumentFolderDTO[];
  documents: DocumentDTO[];
}

export interface MyDocuments {
  shared: DocumentScope;
  personal: DocumentScope;
}

// `ownerEmployeeId` null/undefined = ámbito compartido (global).
export const getDocuments = async (ownerEmployeeId?: number | null): Promise<DocumentScope> => {
  const response = await api.get("/documents", {
    params:
      ownerEmployeeId != null ? { ownerEmployeeId, _t: Date.now() } : { _t: Date.now() },
  });
  return response.data.data;
};

// Ámbito privado del usuario autenticado ("Solo para mí"). El servidor lo ata al
// usuario del token, no a un id enviado desde el cliente.
export const getPersonalDocuments = async (): Promise<DocumentScope> => {
  const response = await api.get("/documents", {
    params: { scope: "personal", _t: Date.now() },
  });
  return response.data.data;
};

export const createDocumentFolder = async (input: {
  name: string;
  parentId?: number | null;
  ownerEmployeeId?: number | null;
  personal?: boolean;
}): Promise<DocumentFolderDTO> => {
  const { personal, ...rest } = input;
  const response = await api.post(
    "/documents/folders",
    personal ? { ...rest, scope: "personal" } : rest,
  );
  invalidateCache("/documents");
  return response.data;
};

export const deleteDocumentFolder = async (id: number): Promise<void> => {
  await api.delete(`/documents/folders/${id}`);
  invalidateCache("/documents");
};

export const uploadDocument = async (input: {
  name: string;
  folderId?: number | null;
  ownerEmployeeId?: number | null;
  personal?: boolean;
  mimeType?: string | null;
  size?: number;
  data: string;
}): Promise<DocumentDTO> => {
  const { personal, ...rest } = input;
  const response = await api.post(
    "/documents/files",
    personal ? { ...rest, scope: "personal" } : rest,
  );
  invalidateCache("/documents");
  return response.data;
};

// Trae el archivo completo (con su data URL) para descargarlo.
export const downloadDocument = async (id: number): Promise<DocumentDTO> => {
  const response = await api.get(`/documents/files/${id}`);
  return response.data;
};

export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/files/${id}`);
  invalidateCache("/documents");
};

// Documentos visibles para el usuario autenticado (compartidos + los suyos).
export const getMyDocuments = async (): Promise<MyDocuments> => {
  const response = await api.get("/me/documents", { params: { _t: Date.now() } });
  return response.data;
};

// Trae un archivo visible en Mi Panel con su binario. Va por el endpoint de
// autoservicio (`/me/documents/:id`): el empleado no tiene `documents:view`, así
// que el de administración le devolvería 403.
export const downloadMyDocument = async (id: number): Promise<DocumentDTO> => {
  const response = await api.get(`/me/documents/${id}`);
  return response.data;
};

// ─── Editor de oficina (ONLYOFFICE) ─────────────────────────────────────────

/** Config que se pasa a `DocsAPI.DocEditor` más la URL del document server. */
export interface OfficeEditorConfig {
  documentServerUrl: string;
  config: Record<string, unknown>;
}

// Extensiones que abre el editor de oficina. Debe ir en línea con el servidor
// (`onlyofficeService`), que es quien valida el tipo de documento.
const OFFICE_EXTENSIONS = [
  "doc",
  "docm",
  "docx",
  "dot",
  "dotm",
  "dotx",
  "odt",
  "ott",
  "rtf",
  "txt",
  "xls",
  "xlsb",
  "xlsm",
  "xlsx",
  "xlt",
  "xltm",
  "xltx",
  "csv",
  "ods",
  "ots",
  "ppt",
  "pptm",
  "pptx",
  "odp",
  "otp",
];

/** true si el archivo se puede editar en el editor de oficina. */
export const isOfficeDocument = (name: string): boolean => {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() : "";
  return extension ? OFFICE_EXTENSIONS.includes(extension) : false;
};

// Config firmada del editor para un archivo (exige `documents:manage`).
export const getOfficeEditorConfig = async (id: number): Promise<OfficeEditorConfig> => {
  const response = await api.get(`/documents/files/${id}/office-config`);
  return response.data;
};

// ─── Compartición explícita y acciones masivas ──────────────────────────────

// Comparte varios archivos con varios destinatarios (empleados y/o usuarios).
export const shareDocuments = async (input: {
  documentIds: number[];
  recipients: ShareRecipient[];
  permission: SharePermission;
}): Promise<{ shared: number }> => {
  const response = await api.post("/documents/shares", input);
  invalidateCache("/documents");
  return response.data;
};

// Destinatarios actuales de un archivo.
export const getDocumentShares = async (documentId: number): Promise<DocumentShareDTO[]> => {
  const response = await api.get(`/documents/files/${documentId}/shares`);
  return response.data.data;
};

// Quita un destinatario de un archivo.
export const removeDocumentShare = async (shareId: number): Promise<void> => {
  await api.delete(`/documents/shares/${shareId}`);
  invalidateCache("/documents");
};

// Mueve varios archivos/carpetas a otra carpeta (o a la raíz) del mismo ámbito.
export const moveDocumentItems = async (input: {
  documentIds?: number[];
  folderIds?: number[];
  targetFolderId?: number | null;
  ownerEmployeeId?: number | null;
  personal?: boolean;
}): Promise<{ moved: number }> => {
  const { personal, ...rest } = input;
  const response = await api.post(
    "/documents/move",
    personal ? { ...rest, scope: "personal" } : rest,
  );
  invalidateCache("/documents");
  return response.data;
};

// Construye un ZIP con los archivos seleccionados (descarga múltiple).
export const buildDocumentsZip = async (documents: DocumentDTO[]): Promise<Blob> => {
  const zip = new JSZip();
  const used = new Set<string>();
  for (const doc of documents) {
    const full = await downloadDocument(doc.id);
    const dataUrl = full.data ?? "";
    const comma = dataUrl.indexOf(",");
    if (comma < 0) continue;
    let name = doc.name || `archivo-${doc.id}`;
    if (used.has(name)) {
      const dot = name.lastIndexOf(".");
      const base = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : "";
      let counter = 2;
      while (used.has(`${base} (${counter})${ext}`)) counter += 1;
      name = `${base} (${counter})${ext}`;
    }
    used.add(name);
    zip.file(name, dataUrl.slice(comma + 1), { base64: true });
  }
  return zip.generateAsync({ type: "blob" });
};
