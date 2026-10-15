// Integración con ONLYOFFICE Docs (servidor de documentos self-hosted).
//
// El motor de oficina no edita en el navegador: el editor es un iframe que carga
// el document server, y este descarga el archivo desde una URL nuestra, lo edita
// y devuelve el resultado a un callback. Por eso hacen falta tres piezas:
//   1. Una config firmada (JWT) que el frontend pasa al editor.
//   2. Una URL de descarga del archivo original (con token propio, porque el
//      document server no lleva la sesión del usuario).
//   3. Un callback que recibe el archivo editado y lo guarda.
//
// El secreto JWT es compartido con el document server (`ONLYOFFICE_JWT_SECRET`).
import jwt from "jsonwebtoken";
import { ServiceError } from "../utils/errors";

/** Tipos de editor de ONLYOFFICE y las extensiones que acepta cada uno. */
type OfficeDocumentType = "word" | "cell" | "slide";

const FILE_TYPE_BY_DOCUMENT_TYPE: Record<OfficeDocumentType, readonly string[]> = {
  word: [
    "doc",
    "docm",
    "docx",
    "dot",
    "dotm",
    "dotx",
    "epub",
    "fodt",
    "htm",
    "html",
    "md",
    "odt",
    "ott",
    "rtf",
    "txt",
  ],
  cell: [
    "csv",
    "et",
    "ett",
    "fods",
    "ods",
    "ots",
    "xls",
    "xlsb",
    "xlsm",
    "xlsx",
    "xlt",
    "xltm",
    "xltx",
  ],
  slide: [
    "dps",
    "dpt",
    "fodp",
    "odp",
    "otp",
    "pot",
    "potm",
    "potx",
    "pps",
    "ppsm",
    "ppsx",
    "ppt",
    "pptm",
    "pptx",
  ],
};

/** Extensiones que abrimos en el editor, mapeadas a su tipo de documento. */
const DOCUMENT_TYPE_BY_FILE_TYPE: Record<string, OfficeDocumentType> = Object.entries(
  FILE_TYPE_BY_DOCUMENT_TYPE,
).reduce(
  (acc, [documentType, fileTypes]) => {
    fileTypes.forEach((fileType) => {
      acc[fileType] = documentType as OfficeDocumentType;
    });
    return acc;
  },
  {} as Record<string, OfficeDocumentType>,
);

/** Extensión en minúsculas de un nombre de archivo ("" si no tiene). */
export const getFileType = (name: string): string =>
  name.includes(".") ? (name.split(".").pop() as string).toLowerCase() : "";

/** Tipo de documento del editor, o null si la extensión no es de oficina. */
export const getDocumentType = (name: string): OfficeDocumentType | null =>
  DOCUMENT_TYPE_BY_FILE_TYPE[getFileType(name)] ?? null;

/** true si el archivo se puede abrir en el editor de ONLYOFFICE. */
export const isEditableDocument = (name: string): boolean => getDocumentType(name) != null;

export const isOnlyOfficeConfigured = (): boolean =>
  Boolean(process.env.ONLYOFFICE_URL && process.env.ONLYOFFICE_JWT_SECRET);

const getSecret = (): string => {
  const secret = process.env.ONLYOFFICE_JWT_SECRET;
  if (!secret) {
    throw new ServiceError(500, "ONLYOFFICE_JWT_SECRET no está configurado.");
  }
  return secret;
};

/** URL pública del document server (sin barra final). */
export const getDocumentServerUrl = (): string => {
  const url = process.env.ONLYOFFICE_URL;
  if (!url) {
    throw new ServiceError(500, "ONLYOFFICE_URL no está configurado.");
  }
  return url.replace(/\/+$/, "");
};

/** Firma un payload con el secreto compartido (HS256). */
export const signToken = (payload: Record<string, unknown>, expiresIn = "5m"): string =>
  jwt.sign(payload, getSecret(), { algorithm: "HS256", expiresIn });

// ─── Token de descarga del archivo ───────────────────────────────────────────
//
// El document server pide el archivo sin sesión del usuario, así que la URL lleva
// un token firmado y de vida corta que solo sirve para leer ese documento.
export const signContentToken = (documentId: number): string =>
  signToken({ documentId, purpose: "content" }, "1h");

export const verifyContentToken = (token: string): number => {
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ["HS256"] }) as {
      documentId?: number;
      purpose?: string;
    };
    if (decoded.purpose !== "content" || typeof decoded.documentId !== "number") {
      throw new Error("payload inesperado");
    }
    return decoded.documentId;
  } catch {
    throw new ServiceError(401, "Enlace de descarga inválido o expirado");
  }
};

// ─── Callback del document server ────────────────────────────────────────────

/** El document server firma cada callback en el header Authorization. */
export interface OnlyOfficeCallback {
  key: string;
  status: number;
  url?: string;
  filetype?: string;
  users?: string[];
}

/**
 * Valida el callback: el header `Authorization: Bearer <jwt>` es un JWT firmado
 * con el mismo secreto cuyo payload es `{ payload: <cuerpo> }`.
 */
export const verifyCallbackToken = (
  authorizationHeader: string | undefined,
): OnlyOfficeCallback => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new ServiceError(401, "Callback sin token de ONLYOFFICE");
  }
  try {
    const decoded = jwt.verify(authorizationHeader.slice(7), getSecret(), {
      algorithms: ["HS256"],
    }) as { payload?: OnlyOfficeCallback };
    if (!decoded.payload) throw new Error("payload ausente");
    return decoded.payload;
  } catch {
    throw new ServiceError(401, "Callback de ONLYOFFICE inválido");
  }
};

/** Estados en los que el document server entrega el archivo editado. */
export const isSaveStatus = (status: number): boolean => status === 2 || status === 6;

// ─── Config del editor ───────────────────────────────────────────────────────

export interface OfficeEditorConfigInput {
  documentId: number;
  name: string;
  revision: number;
  userId: number;
  userName: string;
  /** URL pública de la API (la que el document server puede alcanzar). */
  apiBaseUrl: string;
  mode: "edit" | "view";
}

/**
 * Construye la config (con su token) que el frontend pasa a `DocsAPI.DocEditor`.
 * `key` cambia con cada revisión: es la forma que tiene el editor de invalidar
 * su caché tras un guardado.
 */
export const buildEditorConfig = (input: OfficeEditorConfigInput): Record<string, unknown> => {
  const documentType = getDocumentType(input.name);
  if (!documentType) {
    throw new ServiceError(400, "Este tipo de archivo no se puede editar en el editor");
  }
  const base = input.apiBaseUrl.replace(/\/+$/, "");
  const contentToken = signContentToken(input.documentId);

  const config = {
    documentType,
    type: "desktop",
    document: {
      fileType: getFileType(input.name),
      key: `${input.documentId}-${input.revision}`,
      title: input.name,
      url: `${base}/documents/files/${input.documentId}/content?token=${encodeURIComponent(contentToken)}`,
      permissions: {
        edit: input.mode === "edit",
        download: true,
        print: true,
      },
    },
    editorConfig: {
      mode: input.mode,
      lang: "es",
      callbackUrl: `${base}/documents/files/${input.documentId}/callback`,
      user: { id: String(input.userId), name: input.userName },
      customization: {
        autosave: true,
        forcesave: true,
        compactHeader: true,
      },
    },
  };

  return { ...config, token: signToken(config) };
};

/** Nombre visible del usuario para el editor (con respaldo al nombre de cuenta). */
export const editorUserNameFor = (
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null,
): string => {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return full || username || "Usuario";
};
