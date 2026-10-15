// Página de Documentos.
//
// Administración (Gerencia/Administrativo/SysAdmin) crea carpetas y sube
// archivos en tres ámbitos:
//   - compartido (global): sin dueño (`ownerEmployeeId` y `ownerUserId` null).
//   - de un empleado (`ownerEmployeeId`): visible en la ficha y en su Mi Panel.
//   - privado de un usuario (`ownerUserId`, "Solo para mí"): no depende de una
//     ficha de Planilla, así que cualquier usuario de gestión puede tenerlo.
// Exactamente uno de los dos dueños está definido; nunca los dos.
//
// Los empleados no entran a esta página: ven el ámbito compartido y el de su
// propia ficha desde su Mi Panel (GET /me/documents).
//
// El binario se guarda como data URL base64 en `documents.data`, el mismo
// criterio que los adjuntos de amonestaciones.
import Document from "../models/Document";
import DocumentFolder from "../models/DocumentFolder";
import DocumentShare from "../models/DocumentShare";
import Employee from "../models/Employee";
import User from "../models/User";
import { ServiceError } from "../utils/errors";
import { parseDataUrl, isAllowedAttachmentDataUrl } from "../utils/dataUrl";
import * as storageService from "./storageService";
import * as onlyofficeService from "./onlyofficeService";

/** Tamaño máximo del archivo original (6 MB). El data URL base64 crece ~37%,
 * así que se mantiene por debajo del límite de 10 MB del body parser. */
export const MAX_DOCUMENT_BYTES = 6 * 1024 * 1024;

/** Profundidad máxima del árbol de carpetas (carpeta raíz incluida). */
const MAX_FOLDER_DEPTH = 6;

/**
 * Ámbito de un documento/carpeta. Exactamente uno de los dueños puede tener
 * valor: empleado (ficha), usuario (privado) o ninguno (compartido/global).
 */
export interface DocumentOwner {
  ownerEmployeeId: number | null;
  ownerUserId: number | null;
}

/** Ámbito compartido por toda la empresa (sin dueño). */
export const SHARED_OWNER: DocumentOwner = { ownerEmployeeId: null, ownerUserId: null };

/** Ámbito de la ficha de un empleado. */
export const employeeOwner = (employeeId: number): DocumentOwner => ({
  ownerEmployeeId: employeeId,
  ownerUserId: null,
});

/** Ámbito privado de un usuario ("Solo para mí"). */
export const userOwner = (userId: number): DocumentOwner => ({
  ownerEmployeeId: null,
  ownerUserId: userId,
});

interface PlainRow {
  get: (options: { plain: true }) => Record<string, unknown>;
}

// Sequelize 4 no declara `get()` en el tipo de instancia, así que se castea.
const serialize = (row: unknown): Record<string, any> => (row as PlainRow).get({ plain: true });

/**
 * Metadata del archivo, sin el binario ni la clave interna del bucket (evita
 * arrastrar MB en los listados y no expone la ubicación del objeto).
 */
const withoutData = (document: Document): Record<string, any> => {
  const plain = serialize(document);
  delete plain.data;
  delete plain.storageKey;
  delete plain.storageProvider;
  return plain;
};

/** Normaliza un id opcional; undefined/""/"null" → null; inválido → 400. */
const normalizeId = (value: unknown, label: string): number | null => {
  if (value === undefined || value === null || value === "" || value === "null") return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ServiceError(400, `${label} inválido`);
  }
  return id;
};

/** Resuelve el ámbito a partir de los dueños recibidos (nunca ambos a la vez). */
export const resolveOwner = (input: {
  ownerEmployeeId?: unknown;
  ownerUserId?: unknown;
}): DocumentOwner => {
  const ownerEmployeeId = normalizeId(input.ownerEmployeeId, "Empleado");
  const ownerUserId = normalizeId(input.ownerUserId, "Usuario");
  if (ownerEmployeeId != null && ownerUserId != null) {
    throw new ServiceError(400, "El ámbito de documentos es ambiguo");
  }
  return { ownerEmployeeId, ownerUserId };
};

const ownerWhere = (owner: DocumentOwner): DocumentOwner => ({
  ownerEmployeeId: owner.ownerEmployeeId,
  ownerUserId: owner.ownerUserId,
});

const assertEmployeeExists = async (ownerEmployeeId: number | null): Promise<void> => {
  if (ownerEmployeeId == null) return;
  const employee = await Employee.findByPk(ownerEmployeeId, { attributes: ["id"] });
  if (!employee) throw new ServiceError(404, "Empleado no encontrado");
};

const findFolderOrFail = async (rawId: unknown): Promise<DocumentFolder | null> => {
  const id = normalizeId(rawId, "Carpeta");
  if (id == null) return null;
  const folder = await DocumentFolder.findByPk(id);
  if (!folder) throw new ServiceError(404, "Carpeta no encontrada");
  return folder;
};

const sameOwner = (
  item: { ownerEmployeeId?: number | null; ownerUserId?: number | null },
  owner: DocumentOwner,
): boolean =>
  (item.ownerEmployeeId ?? null) === owner.ownerEmployeeId &&
  (item.ownerUserId ?? null) === owner.ownerUserId;

const assertSameOwner = (folder: DocumentFolder, owner: DocumentOwner): void => {
  if (!sameOwner(folder, owner)) {
    throw new ServiceError(400, "La carpeta pertenece a otro ámbito de documentos");
  }
};

const assertDepth = async (folder: DocumentFolder, owner: DocumentOwner): Promise<void> => {
  // Se cargan las carpetas del ámbito de una vez y se recorre la cadena en
  // memoria (evita una consulta por nivel).
  const folders = await DocumentFolder.findAll({
    where: ownerWhere(owner),
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

/** Carpetas y archivos de un ámbito. */
export const listScope = async (owner: DocumentOwner) => {
  const where = ownerWhere(owner);
  const [folders, documents] = await Promise.all([
    DocumentFolder.findAll({ where, order: [["name", "ASC"]] }),
    Document.findAll({
      where,
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
  const [shared, personal] = await Promise.all([
    listScope(SHARED_OWNER),
    listScope(employeeOwner(employeeId)),
  ]);
  return { shared, personal };
};

/**
 * Documentos que ve un usuario en su panel: el ámbito compartido y, dentro de
 * "Tus documentos", los de su ficha (si tiene empleado) o su ámbito privado
 * ("Solo para mí"), más los archivos que le compartieron explícitamente. Los
 * compartidos se presentan en la raíz (sin carpeta del dueño original).
 */
export const listForUser = async (userId: number, employeeId: number | null) => {
  const personalOwner = employeeId != null ? employeeOwner(employeeId) : userOwner(userId);
  const [shared, personal, sharedWith] = await Promise.all([
    listScope(SHARED_OWNER),
    listScope(personalOwner),
    listSharedWith(userId, employeeId),
  ]);

  const existing = new Set(personal.documents.map((doc) => doc.id));
  const documents = [...personal.documents, ...sharedWith.filter((doc) => !existing.has(doc.id))];
  return { shared, personal: { folders: personal.folders, documents } };
};

// Archivos compartidos explícitamente con este usuario o con su ficha. Se
// fuerzan a la raíz (folderId null) para que encajen en el árbol del receptor.
const listSharedWith = async (
  userId: number,
  employeeId: number | null,
): Promise<Record<string, any>[]> => {
  const recipients: Record<string, unknown>[] = [{ userId }];
  if (employeeId != null) recipients.push({ employeeId });

  const shares = await DocumentShare.findAll({
    where: { $or: recipients },
    attributes: ["documentId", "permission"],
  });
  if (shares.length === 0) return [];

  const permissionById = new Map(shares.map((share) => [share.documentId, share.permission]));
  const documents = await Document.findAll({
    where: { id: Array.from(permissionById.keys()) },
    attributes: { exclude: ["data"] },
    order: [["createdAt", "DESC"]],
  });
  return documents.map((document): Record<string, any> => ({
    ...withoutData(document),
    folderId: null,
    sharePermission: permissionById.get(document.id) ?? "view",
  }));
};

/**
 * Archivo completo (con su binario) si el usuario puede verlo desde su panel:
 * el ámbito compartido, su ámbito personal (ficha o "Solo para mí") o algo que
 * le compartieron explícitamente. Un archivo fuera de su alcance devuelve 404,
 * igual que uno inexistente, para no revelar que existe.
 */
export const getVisibleDocument = async (
  userId: number,
  employeeId: number | null,
  documentId: number,
): Promise<Record<string, any>> => {
  const document = await Document.findByPk(documentId);
  if (!document) throw new ServiceError(404, "Archivo no encontrado");

  const ownerEmployeeId = document.ownerEmployeeId ?? null;
  const ownerUserId = document.ownerUserId ?? null;
  const isSharedScope = ownerEmployeeId == null && ownerUserId == null;
  const isPersonal =
    employeeId != null
      ? ownerEmployeeId === employeeId && ownerUserId == null
      : ownerUserId === userId && ownerEmployeeId == null;

  let visible = isSharedScope || isPersonal;
  if (!visible) {
    const recipients: Record<string, unknown>[] = [{ userId }];
    if (employeeId != null) recipients.push({ employeeId });
    const share = await DocumentShare.findOne({
      where: { documentId, $or: recipients },
      attributes: ["id"],
    });
    visible = share != null;
  }
  if (!visible) throw new ServiceError(404, "Archivo no encontrado");

  return serialize(document);
};

export interface CreateFolderInput {
  name?: string;
  parentId?: number | string | null;
  ownerEmployeeId?: number | string | null;
  ownerUserId?: number | string | null;
  userId?: number | null;
}

/** Crea una carpeta dentro de un ámbito (compartido, de empleado o de usuario). */
export const createFolder = async (input: CreateFolderInput) => {
  const name = String(input.name ?? "").trim();
  if (!name) throw new ServiceError(400, "El nombre de la carpeta es obligatorio");
  if (name.length > 120) throw new ServiceError(400, "El nombre de la carpeta es demasiado largo");

  const owner = resolveOwner(input);
  await assertEmployeeExists(owner.ownerEmployeeId);

  const parent = await findFolderOrFail(input.parentId);
  if (parent) {
    assertSameOwner(parent, owner);
    await assertDepth(parent, owner);
  }

  const folder = await DocumentFolder.create({
    name,
    parentId: parent ? parent.id : null,
    ownerEmployeeId: owner.ownerEmployeeId,
    ownerUserId: owner.ownerUserId,
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
  ownerUserId?: number | string | null;
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

  const owner = resolveOwner(input);
  await assertEmployeeExists(owner.ownerEmployeeId);

  const folder = await findFolderOrFail(input.folderId);
  if (folder) assertSameOwner(folder, owner);

  const size = Number(input.size);
  const mimeType = (input.mimeType ?? parsed.mime) || null;
  const fileSize = Number.isFinite(size) && size >= 0 ? Math.round(size) : 0;

  // El binario va al bucket cuando hay almacenamiento configurado; si no, se
  // conserva el data URL (comportamiento anterior) para no bloquear la subida.
  let storageKey: string | null = null;
  let legacyData: string | null = null;
  if (storageService.isStorageConfigured()) {
    const buffer = Buffer.from(parsed.base64, "base64");
    storageKey = await storageService.putObject(
      buffer,
      mimeType ?? "application/octet-stream",
      name,
    );
  } else {
    legacyData = data;
  }

  const document = await Document.create({
    folderId: folder ? folder.id : null,
    ownerEmployeeId: owner.ownerEmployeeId,
    ownerUserId: owner.ownerUserId,
    name,
    mimeType,
    size: fileSize,
    data: legacyData,
    storageKey,
    storageProvider: storageKey ? "s3" : null,
    revision: 1,
    uploadedBy: input.userId ?? null,
  });
  return withoutData(document);
};

/** Archivo completo (con su binario) para descargar, como data URL. */
export const getDocument = async (id: number) => {
  const document = await Document.findByPk(id);
  if (!document) throw new ServiceError(404, "Archivo no encontrado");
  const plain = serialize(document);
  // Los archivos del bucket no traen el binario en la fila: se reconstruye el
  // data URL para no cambiar el contrato del endpoint de descarga.
  if (document.storageKey) {
    const buffer = await storageService.getObjectBuffer(document.storageKey);
    const mime = document.mimeType || "application/octet-stream";
    plain.data = `data:${mime};base64,${buffer.toString("base64")}`;
  }
  delete plain.storageKey;
  delete plain.storageProvider;
  return plain;
};

/** Contenido binario de un archivo (para servirlo al document server). */
export const getDocumentContent = async (id: number) => {
  const document = await Document.findByPk(id);
  if (!document) throw new ServiceError(404, "Archivo no encontrado");
  if (document.storageKey) {
    const buffer = await storageService.getObjectBuffer(document.storageKey);
    return {
      buffer,
      mimeType: document.mimeType || "application/octet-stream",
      name: document.name,
    };
  }
  const parsed = parseDataUrl(document.data ?? "");
  if (!parsed) throw new ServiceError(404, "El archivo no tiene contenido");
  return {
    buffer: Buffer.from(parsed.base64, "base64"),
    mimeType: document.mimeType || parsed.mime,
    name: document.name,
  };
};

export const deleteDocument = async (id: number) => {
  const document = await Document.findByPk(id);
  if (!document) throw new ServiceError(404, "Archivo no encontrado");
  const { storageKey } = document;
  await document.destroy();
  // El objeto se borra después de la fila: si el storage falla, a lo sumo queda
  // un objeto sin referencia (no bloquea el borrado que el usuario ya pidió).
  if (storageKey) {
    try {
      await storageService.deleteObject(storageKey);
    } catch {
      // El objeto ya no existe o el storage no responde.
    }
  }
  return true;
};

// ─── Edición en el editor de oficina (ONLYOFFICE) ────────────────────────────

/** MIME por extensión, para cuando la fila no lo trae (archivos antiguos). */
const OFFICE_MIME: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  csv: "text/csv",
  txt: "text/plain",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
};

export interface OfficeEditorUser {
  id: number;
  name: string;
}

/**
 * Config que el frontend pasa a `DocsAPI.DocEditor`. Solo para archivos de
 * oficina, y solo con el document server configurado en el servidor.
 */
export const buildOfficeEditor = async (
  id: number,
  user: OfficeEditorUser,
  apiBaseUrl: string,
  mode: "edit" | "view" = "edit",
) => {
  const document = await Document.findByPk(id);
  if (!document) throw new ServiceError(404, "Archivo no encontrado");
  if (!onlyofficeService.isEditableDocument(document.name)) {
    throw new ServiceError(400, "Este tipo de archivo no se puede editar en el editor de oficina");
  }
  if (!onlyofficeService.isOnlyOfficeConfigured()) {
    throw new ServiceError(503, "El editor de oficina no está configurado en el servidor");
  }
  return {
    documentServerUrl: onlyofficeService.getDocumentServerUrl(),
    config: onlyofficeService.buildEditorConfig({
      documentId: document.id,
      name: document.name,
      revision: document.revision ?? 1,
      userId: user.id,
      userName: user.name,
      apiBaseUrl,
      mode,
    }),
  };
};

/**
 * Guarda el archivo devuelto por el editor: sube la nueva versión al bucket y
 * bumpea `revision` (la clave del editor cambia, así que la siguiente sesión
 * parte del contenido nuevo y no de la caché).
 */
export const saveDocumentContent = async (
  id: number,
  buffer: Buffer,
  fileType?: string | null,
): Promise<Record<string, any>> => {
  const document = await Document.findByPk(id);
  if (!document) throw new ServiceError(404, "Archivo no encontrado");
  if (!storageService.isStorageConfigured()) {
    throw new ServiceError(503, "El almacenamiento de archivos no está configurado.");
  }

  const previousKey = document.storageKey;
  const extension = (fileType ?? "").toLowerCase();
  const mimeType = document.mimeType || OFFICE_MIME[extension] || "application/octet-stream";
  const storageKey = await storageService.putObject(buffer, mimeType, document.name);

  document.storageKey = storageKey;
  document.storageProvider = "s3";
  document.data = null;
  document.mimeType = mimeType;
  document.size = buffer.length;
  document.revision = (document.revision ?? 1) + 1;
  await document.save();

  if (previousKey && previousKey !== storageKey) {
    try {
      await storageService.deleteObject(previousKey);
    } catch {
      // La versión anterior ya no existe o el storage no responde.
    }
  }
  return withoutData(document);
};

// ─── Compartición explícita ──────────────────────────────────────────────────

export type SharePermission = "view" | "comment" | "edit";

const SHARE_PERMISSIONS: SharePermission[] = ["view", "comment", "edit"];

const normalizePermission = (value: unknown): SharePermission => {
  const permission = String(value ?? "view").toLowerCase() as SharePermission;
  if (!SHARE_PERMISSIONS.includes(permission)) {
    throw new ServiceError(400, "Permiso de compartición inválido");
  }
  return permission;
};

/** Normaliza una lista de ids (acepta uno solo); descarta duplicados. */
const toIdArray = (value: unknown, label: string): number[] => {
  if (value == null) return [];
  const items = Array.isArray(value) ? value : [value];
  const ids = items.map((item) => Number(item));
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new ServiceError(400, `Id de ${label} inválido`);
  }
  return Array.from(new Set(ids));
};

export interface ShareRecipientInput {
  type: "employee" | "user";
  id: number | string;
}

// Convierte los destinatarios del cliente en filas { employeeId, userId } y
// verifica que existan.
const normalizeRecipients = async (
  recipients: unknown,
): Promise<{ employeeId: number | null; userId: number | null }[]> => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new ServiceError(400, "No hay destinatarios a los que compartir");
  }

  const seen = new Set<string>();
  const rows = (recipients as ShareRecipientInput[])
    .map((raw) => {
      const id = Number(raw?.id);
      if (!Number.isInteger(id) || id <= 0) throw new ServiceError(400, "Destinatario inválido");
      const type = raw?.type;
      if (type !== "employee" && type !== "user") {
        throw new ServiceError(400, "Tipo de destinatario inválido");
      }
      return { type, id };
    })
    .filter(({ type, id }) => {
      const key = `${type}:${id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ type, id }) => ({
      employeeId: type === "employee" ? id : null,
      userId: type === "user" ? id : null,
    }));

  const employeeIds = rows
    .filter((row) => row.employeeId != null)
    .map((row) => row.employeeId as number);
  const userIds = rows.filter((row) => row.userId != null).map((row) => row.userId as number);
  const [employeesFound, usersFound] = await Promise.all([
    employeeIds.length
      ? Employee.findAll({ where: { id: employeeIds }, attributes: ["id"] })
      : Promise.resolve([]),
    userIds.length
      ? User.findAll({ where: { id: userIds }, attributes: ["id"] })
      : Promise.resolve([]),
  ]);
  if (employeeIds.length && employeesFound.length !== employeeIds.length) {
    throw new ServiceError(404, "Algún empleado no existe");
  }
  if (userIds.length && usersFound.length !== userIds.length) {
    throw new ServiceError(404, "Algún usuario no existe");
  }
  return rows;
};

export interface ShareDocumentsInput {
  documentIds?: unknown;
  recipients?: unknown;
  permission?: unknown;
  userId?: number | null;
}

/** Comparte varios archivos con varios destinatarios en una sola operación. */
export const shareDocuments = async (input: ShareDocumentsInput) => {
  const permission = normalizePermission(input.permission);
  const documentIds = toIdArray(input.documentIds, "archivo");
  if (documentIds.length === 0) throw new ServiceError(400, "No hay archivos para compartir");
  const recipients = await normalizeRecipients(input.recipients);

  const documents = await Document.findAll({ where: { id: documentIds }, attributes: ["id"] });
  if (documents.length !== documentIds.length) {
    throw new ServiceError(404, "Algún archivo no existe");
  }

  const results = await Promise.all(
    documentIds.flatMap((documentId) =>
      recipients.map(async (recipient) => {
        const where = {
          documentId,
          employeeId: recipient.employeeId,
          userId: recipient.userId,
        };
        const existing = await DocumentShare.findOne({ where });
        if (!existing) {
          await DocumentShare.create({ ...where, permission, createdBy: input.userId ?? null });
        } else if (existing.permission !== permission) {
          existing.permission = permission;
          await existing.save();
        }
      }),
    ),
  );
  const shared = results.length;
  return { shared };
};

/** Destinatarios actuales de un archivo, con su nombre para la interfaz. */
export const listShares = async (documentId: number) => {
  const document = await Document.findByPk(documentId, { attributes: ["id"] });
  if (!document) throw new ServiceError(404, "Archivo no encontrado");

  const shares = await DocumentShare.findAll({
    where: { documentId },
    order: [["createdAt", "ASC"]],
  });
  const employeeIds = Array.from(
    new Set(shares.map((share) => share.employeeId).filter((id): id is number => id != null)),
  );
  const userIds = Array.from(
    new Set(shares.map((share) => share.userId).filter((id): id is number => id != null)),
  );
  const [employees, users] = await Promise.all([
    employeeIds.length
      ? Employee.findAll({
          where: { id: employeeIds },
          attributes: ["id", "firstName", "lastName"],
        })
      : Promise.resolve([]),
    userIds.length
      ? User.findAll({
          where: { id: userIds },
          attributes: ["id", "firstName", "lastName", "username"],
        })
      : Promise.resolve([]),
  ]);
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const userById = new Map(users.map((user) => [user.id, user]));

  return shares.map((share) => {
    const plain = serialize(share);
    if (share.employeeId != null) {
      const employee = employeeById.get(share.employeeId);
      return {
        ...plain,
        recipientType: "employee",
        recipientName: employee ? `${employee.firstName} ${employee.lastName}`.trim() : null,
      };
    }
    const user = share.userId != null ? userById.get(share.userId) : undefined;
    return {
      ...plain,
      recipientType: "user",
      recipientName: user ? `${user.firstName} ${user.lastName}`.trim() || user.username : null,
    };
  });
};

/** Quita un destinatario de un archivo. */
export const removeShare = async (id: number) => {
  const share = await DocumentShare.findByPk(id);
  if (!share) throw new ServiceError(404, "Compartición no encontrada");
  await share.destroy();
  return true;
};

export interface MoveItemsInput {
  documentIds?: unknown;
  folderIds?: unknown;
  targetFolderId?: unknown;
  owner: DocumentOwner;
}

/** Mueve varios archivos/carpetas a otra carpeta (o a la raíz) del mismo ámbito. */
export const moveItems = async (input: MoveItemsInput) => {
  const documentIds = toIdArray(input.documentIds, "archivo");
  const folderIds = toIdArray(input.folderIds, "carpeta");
  if (documentIds.length === 0 && folderIds.length === 0) {
    throw new ServiceError(400, "No hay elementos para mover");
  }

  const target = await findFolderOrFail(input.targetFolderId);
  if (target) assertSameOwner(target, input.owner);
  const targetFolderId = target ? target.id : null;

  // Evita mover una carpeta dentro de sí misma o de una de sus descendientes.
  if (target && folderIds.length) {
    const all = await DocumentFolder.findAll({
      where: ownerWhere(input.owner),
      attributes: ["id", "parentId"],
    });
    const childrenOf = new Map<number, number[]>();
    all.forEach((folder) => {
      const parentId = folder.parentId ?? -1;
      const list = childrenOf.get(parentId) ?? [];
      list.push(folder.id);
      childrenOf.set(parentId, list);
    });
    const isSelfOrDescendant = (ancestorId: number, nodeId: number): boolean => {
      const stack = [ancestorId];
      while (stack.length > 0) {
        const current = stack.pop() as number;
        if (current === nodeId) return true;
        (childrenOf.get(current) ?? []).forEach((child) => stack.push(child));
      }
      return false;
    };
    if (folderIds.some((id) => isSelfOrDescendant(id, target.id))) {
      throw new ServiceError(400, "No puedes mover una carpeta dentro de sí misma");
    }
  }

  if (documentIds.length > 0) {
    const documents = await Document.findAll({ where: { id: documentIds } });
    if (documents.length !== documentIds.length)
      throw new ServiceError(404, "Algún archivo no existe");
    documents.forEach((document) => {
      if (!sameOwner(document, input.owner)) {
        throw new ServiceError(400, "El archivo pertenece a otro ámbito de documentos");
      }
    });
    await Document.update({ folderId: targetFolderId }, { where: { id: documentIds } });
  }

  if (folderIds.length > 0) {
    const folders = await DocumentFolder.findAll({ where: { id: folderIds } });
    if (folders.length !== folderIds.length)
      throw new ServiceError(404, "Alguna carpeta no existe");
    folders.forEach((folder) => assertSameOwner(folder, input.owner));
    await DocumentFolder.update({ parentId: targetFolderId }, { where: { id: folderIds } });
  }

  return { moved: documentIds.length + folderIds.length };
};
