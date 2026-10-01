import api, { invalidateCache } from "./api";

// Documentos: carpetas y archivos. El binario viaja como data URL base64, así
// que se envían/reciben objetos JSON normales.
export interface DocumentFolderDTO {
  id: number;
  name: string;
  parentId: number | null;
  ownerEmployeeId: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentDTO {
  id: number;
  folderId: number | null;
  ownerEmployeeId: number | null;
  name: string;
  mimeType: string | null;
  size: number;
  createdAt?: string;
  updatedAt?: string;
  /** Solo en la descarga de un archivo concreto. */
  data?: string;
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

export const createDocumentFolder = async (input: {
  name: string;
  parentId?: number | null;
  ownerEmployeeId?: number | null;
}): Promise<DocumentFolderDTO> => {
  const response = await api.post("/documents/folders", input);
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
  mimeType?: string | null;
  size?: number;
  data: string;
}): Promise<DocumentDTO> => {
  const response = await api.post("/documents/files", input);
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
