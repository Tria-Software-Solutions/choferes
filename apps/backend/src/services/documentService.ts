// Página de Documentos.
//
// Administración (Gerencia/Administrativo/SysAdmin) crea carpetas y sube
// archivos en dos ámbitos: el compartido (`ownerEmployeeId` null) y el personal
// de cada empleado. Los empleados no entran a esta página: ven el ámbito
// compartido y el suyo propio desde su Mi Panel (GET /me/documents).
//
// El binario se guarda como data URL base64 en `documents.data`, el mismo
// criterio que los adjuntos de amonestaciones.
import Document from "../models/Document";
import DocumentFolder from "../models/DocumentFolder";
import Employee from "../models/Employee";
import { ServiceError } from "../utils/errors";
import { parseDataUrl, isAllowedAttachmentDataUrl } from "../utils/dataUrl";

/** Tamaño máximo del archivo original (6 MB). El data URL base64 crece ~37%,
 * así que se mantiene por debajo del límite de 10 MB del body parser. */
export const MAX_DOCUMENT_BYTES = 6 * 1024 * 1024;

/** Profundidad máxima del árbol de carpetas (carpeta raíz incluida). */
const MAX_FOLDER_DEPTH = 6;

interface PlainRow {
  get: (options: { plain: true }) => Record<string, unknown>;
}

// Sequelize 4 no declara `get()` en el tipo de instancia, así que se castea.
const serialize = (row: Document | DocumentFolder): Record<string, any> =>
  (row as unknown as PlainRow).get({ plain: true });

/** Metadata del archivo, sin el binario (evita arrastrar MB en los listados). */
const withoutData = (document: Document): Record<string, any> => {
  const plain = serialize(document);
  delete plain.data;
  return plain;
};

/** Normaliza el ámbito: undefined/""/"null" → compartido (null). */
const normalizeOwner = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "" || value === "null") return null;
  const owner = Number(value);
  if (!Number.isInteger(owner) || owner <= 0) {
    throw new ServiceError(400, "Empleado inválido");
  }
  return owner;
};

const assertEmployeeExists = async (ownerEmployeeId: number | null): Promise<void> => {
  if (ownerEmployeeId == null) return;
  const employee = await Employee.findByPk(ownerEmployeeId, { attributes: ["id"] });
  if (!employee) throw new ServiceError(404, "Empleado no encontrado");
};

const findFolderOrFail = async (rawId: unknown): Promise<DocumentFolder | null> => {
  if (rawId === undefined || rawId === null || rawId === "" || rawId === "null") return null;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ServiceError(400, "Carpeta inválida");
  }
  const folder = await DocumentFolder.findByPk(id);
  if (!folder) throw new ServiceError(404, "Carpeta no encontrada");
  return folder;
};

const assertSameOwner = (folder: DocumentFolder, owner: number | null): void => {
  if ((folder.ownerEmployeeId ?? null) !== owner) {
    throw new ServiceError(400, "La carpeta pertenece a otro ámbito de documentos");
  }
};

const assertDepth = async (
  folder: DocumentFolder,
  ownerEmployeeId: number | null,
): Promise<void> => {
  // Se cargan las carpetas del ámbito de una vez y se recorre la cadena en
  // memoria (evita una consulta por nivel).
  const folders = await DocumentFolder.findAll({
    where: { ownerEmployeeId },
    attributes: ["id", "parentId"],
  });
  const byId = new Map(folders.map((item) => [item.id, item]));

  let depth = 1;
  let cursor: DocumentFolder | undefined = folder;
  while (cursor?.parentId) {
    cursor = byId.get(cursor.parentId);
    if (!cursor) break;
    depth += 1;
    if (depth >= MAX_FOLDER_DEPTH) {
      throw new ServiceError(400, "El árbol de carpetas es demasiado profundo");
    }
  }
};

/** Carpetas y archivos de un ámbito (global si `ownerEmployeeId` es null). */
export const listScope = async (ownerEmployeeId: number | null) => {
  const [folders, documents] = await Promise.all([
    DocumentFolder.findAll({ where: { ownerEmployeeId }, order: [["name", "ASC"]] }),
    Document.findAll({
      where: { ownerEmployeeId },
      attributes: { exclude: ["data"] },
      order: [["createdAt", "DESC"]],
    }),
  ]);
  return {
    folders: folders.map(serialize),
    documents: documents.map(withoutData),
  };
};

/** Ámbitos que ve un empleado: el compartido y el personal de su ficha. */
export const listForEmployee = async (employeeId: number) => {
  const [shared, personal] = await Promise.all([listScope(null), listScope(employeeId)]);
  return { shared, personal };
};

export interface CreateFolderInput {
  name?: string;
  parentId?: number | string | null;
  ownerEmployeeId?: number | string | null;
  userId?: number | null;
}

/** Crea una carpeta dentro de un ámbito (global o de un empleado). */
export const createFolder = async (input: CreateFolderInput) => {
  const name = String(input.name ?? "").trim();
  if (!name) throw new ServiceError(400, "El nombre de la carpeta es obligatorio");
  if (name.length > 120) throw new ServiceError(400, "El nombre de la carpeta es demasiado largo");

  const owner = normalizeOwner(input.ownerEmployeeId);
  await assertEmployeeExists(owner);

  const parent = await findFolderOrFail(input.parentId);
  if (parent) {
    assertSameOwner(parent, owner);
    await assertDepth(parent, owner);
  }

  const folder = await DocumentFolder.create({
    name,
    parentId: parent ? parent.id : null,
    ownerEmployeeId: owner,
    createdBy: input.userId ?? null,
  });
  return serialize(folder);
};

/** Elimina una carpeta; sus subcarpetas y archivos caen en cascada (FK). */
export const deleteFolder = async (id: number) => {
  const folder = await DocumentFolder.findByPk(id);
  if (!folder) throw new ServiceError(404, "Carpeta no encontrada");
  await folder.destroy();
  return true;
};

export interface CreateDocumentInput {
  folderId?: number | string | null;
  ownerEmployeeId?: number | string | null;
  name?: string;
  mimeType?: string | null;
  size?: number | string | null;
  data?: string;
  userId?: number | null;
}

/** Sube un archivo (data URL base64) dentro de un ámbito. */
export const createDocument = async (input: CreateDocumentInput) => {
  const name = String(input.name ?? "").trim();
  if (!name) throw new ServiceError(400, "El nombre del archivo es obligatorio");
  if (name.length > 200) throw new ServiceError(400, "El nombre del archivo es demasiado largo");

  const data = typeof input.data === "string" ? input.data : "";
  const parsed = parseDataUrl(data);
  if (!parsed || !isAllowedAttachmentDataUrl(data)) {
    throw new ServiceError(400, "El archivo debe ser un tipo permitido en data URL base64");
  }
  // El data URL crece ~37% respecto al binario; se compara contra el mismo tope.
  if (data.length > MAX_DOCUMENT_BYTES * 1.4) {
    throw new ServiceError(413, "El archivo supera el tamaño máximo permitido (6 MB)");
  }

  const owner = normalizeOwner(input.ownerEmployeeId);
  await assertEmployeeExists(owner);

  const folder = await findFolderOrFail(input.folderId);
  if (folder) assertSameOwner(folder, owner);

  const size = Number(input.size);

  const document = await Document.create({
    folderId: folder ? folder.id : null,
    ownerEmployeeId: owner,
    name,
    mimeType: (input.mimeType ?? parsed.mime) || null,
    size: Number.isFinite(size) && size >= 0 ? Math.round(size) : 0,
    data,
    uploadedBy: input.userId ?? null,
  });
  return withoutData(document);
};

/** Archivo completo (con su binario) para descargar. */
export const getDocument = async (id: number) => {
  const document = await Document.findByPk(id);
  if (!document) throw new ServiceError(404, "Archivo no encontrado");
  return serialize(document);
};

export const deleteDocument = async (id: number) => {
  const document = await Document.findByPk(id, { attributes: ["id"] });
  if (!document) throw new ServiceError(404, "Archivo no encontrado");
  await document.destroy();
  return true;
};
