jest.mock("../models/Document", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findByPk: jest.fn(), update: jest.fn(), create: jest.fn() },
}));
jest.mock("../models/DocumentFolder", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findByPk: jest.fn(), update: jest.fn(), create: jest.fn() },
}));
jest.mock("../models/DocumentShare", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn() },
}));
jest.mock("../models/Employee", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findByPk: jest.fn() },
}));
jest.mock("../models/User", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findByPk: jest.fn() },
}));
jest.mock("../services/storageService", () => ({
  isStorageConfigured: jest.fn(),
  putObject: jest.fn(),
  getObjectBuffer: jest.fn(),
  deleteObject: jest.fn(),
}));
jest.mock("../services/onlyofficeService", () => ({
  isEditableDocument: jest.fn(),
  isOnlyOfficeConfigured: jest.fn(),
  getDocumentServerUrl: jest.fn(),
  buildEditorConfig: jest.fn(),
}));

import Document from "../models/Document";
import DocumentFolder from "../models/DocumentFolder";
import DocumentShare from "../models/DocumentShare";
import Employee from "../models/Employee";
import User from "../models/User";
import * as storageService from "../services/storageService";
import * as onlyofficeService from "../services/onlyofficeService";
import {
  buildOfficeEditor,
  getDocumentContent,
  getVisibleDocument,
  listForUser,
  moveItems,
  removeShare,
  saveDocumentContent,
  shareDocuments,
} from "../services/documentService";

const DocumentMock = Document as unknown as Record<string, jest.Mock>;
const FolderMock = DocumentFolder as unknown as Record<string, jest.Mock>;
const ShareMock = DocumentShare as unknown as Record<string, jest.Mock>;
const EmployeeMock = Employee as unknown as Record<string, jest.Mock>;
const UserMock = User as unknown as Record<string, jest.Mock>;
const StorageMock = storageService as unknown as Record<string, jest.Mock>;
const OnlyOfficeMock = onlyofficeService as unknown as Record<string, jest.Mock>;

// Instancia de Document con los métodos que el servicio invoca sobre el modelo.
const docInstance = (data: Record<string, unknown>) => {
  const state: Record<string, any> = { ...data };
  return Object.assign(state, {
    get: () => ({ ...state }),
    save: jest.fn(async () => {}),
    destroy: jest.fn(async () => {}),
  });
};

const SHARED = { ownerEmployeeId: null, ownerUserId: null };

beforeEach(() => {
  jest.clearAllMocks();
  EmployeeMock.findAll.mockResolvedValue([]);
  UserMock.findAll.mockResolvedValue([]);
  ShareMock.findOne.mockResolvedValue(null);
  ShareMock.create.mockResolvedValue({});
});

describe("shareDocuments", () => {
  it("comparte varios archivos con varios destinatarios y deduplica", async () => {
    DocumentMock.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    EmployeeMock.findAll.mockResolvedValue([{ id: 7 }]);
    UserMock.findAll.mockResolvedValue([{ id: 3 }]);

    const result = await shareDocuments({
      documentIds: [1, 2],
      recipients: [
        { type: "employee", id: 7 },
        { type: "user", id: 3 },
        { type: "user", id: 3 },
      ],
      permission: "edit",
      userId: 9,
    });

    expect(result).toEqual({ shared: 4 });
    expect(ShareMock.create).toHaveBeenCalledTimes(4);
    expect(ShareMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ documentId: 1, employeeId: 7, userId: null, permission: "edit" }),
    );
  });

  it("actualiza el permiso de una compartición existente", async () => {
    DocumentMock.findAll.mockResolvedValue([{ id: 1 }]);
    EmployeeMock.findAll.mockResolvedValue([{ id: 7 }]);
    const existing = { permission: "view", save: jest.fn() };
    ShareMock.findOne.mockResolvedValue(existing);

    await shareDocuments({
      documentIds: [1],
      recipients: [{ type: "employee", id: 7 }],
      permission: "comment",
    });

    expect(existing.permission).toBe("comment");
    expect(existing.save).toHaveBeenCalled();
    expect(ShareMock.create).not.toHaveBeenCalled();
  });

  it("rechaza un permiso inválido sin consultar archivos", async () => {
    await expect(
      shareDocuments({ documentIds: [1], recipients: [{ type: "user", id: 1 }], permission: "owner" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(DocumentMock.findAll).not.toHaveBeenCalled();
  });

  it("falla si algún destinatario no existe", async () => {
    DocumentMock.findAll.mockResolvedValue([{ id: 1 }]);
    EmployeeMock.findAll.mockResolvedValue([]);

    await expect(
      shareDocuments({ documentIds: [1], recipients: [{ type: "employee", id: 999 }] }),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(ShareMock.create).not.toHaveBeenCalled();
  });
});

describe("removeShare", () => {
  it("elimina la compartición", async () => {
    const destroy = jest.fn();
    ShareMock.findByPk.mockResolvedValue({ destroy });

    await expect(removeShare(3)).resolves.toBe(true);
    expect(destroy).toHaveBeenCalled();
  });

  it("devuelve 404 si no existe", async () => {
    ShareMock.findByPk.mockResolvedValue(null);
    await expect(removeShare(999)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("moveItems", () => {
  it("mueve archivos a la raíz", async () => {
    DocumentMock.findAll.mockResolvedValue([{ id: 1, ...SHARED }]);

    const result = await moveItems({ documentIds: [1], targetFolderId: null, owner: SHARED });

    expect(result).toEqual({ moved: 1 });
    expect(DocumentMock.update).toHaveBeenCalledWith({ folderId: null }, { where: { id: [1] } });
  });

  it("no permite mover una carpeta dentro de sí misma o de una descendiente", async () => {
    FolderMock.findByPk.mockResolvedValue({ id: 9, ...SHARED });
    FolderMock.findAll.mockResolvedValue([
      { id: 9, parentId: null },
      { id: 10, parentId: 9 },
    ]);

    await expect(
      moveItems({ folderIds: [9], targetFolderId: 9, owner: SHARED }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(FolderMock.update).not.toHaveBeenCalled();
  });

  it("exige al menos un elemento", async () => {
    await expect(moveItems({ owner: SHARED })).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("getVisibleDocument", () => {
  const row = (data: Record<string, unknown>) => ({ ...data, get: () => data });

  it("devuelve un archivo del ámbito compartido", async () => {
    DocumentMock.findByPk.mockResolvedValue(
      row({ id: 1, ownerEmployeeId: null, ownerUserId: null, name: "empresa.txt" }),
    );

    await expect(getVisibleDocument(2, null, 1)).resolves.toMatchObject({ id: 1 });
    expect(ShareMock.findOne).not.toHaveBeenCalled();
  });

  it("devuelve un archivo propio de la ficha del empleado vinculado", async () => {
    DocumentMock.findByPk.mockResolvedValue(
      row({ id: 2, ownerEmployeeId: 7, ownerUserId: null }),
    );

    await expect(getVisibleDocument(2, 7, 2)).resolves.toMatchObject({ id: 2 });
  });

  it("devuelve un archivo que le compartieron explícitamente", async () => {
    DocumentMock.findByPk.mockResolvedValue(
      row({ id: 3, ownerEmployeeId: null, ownerUserId: 9 }),
    );
    ShareMock.findOne.mockResolvedValue({ id: 5 });

    await expect(getVisibleDocument(2, null, 3)).resolves.toMatchObject({ id: 3 });
  });

  it("404 si el archivo no existe", async () => {
    DocumentMock.findByPk.mockResolvedValue(null);

    await expect(getVisibleDocument(2, null, 99)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("404 si es de otro ámbito y no está compartido", async () => {
    DocumentMock.findByPk.mockResolvedValue(
      row({ id: 4, ownerEmployeeId: 8, ownerUserId: null }),
    );
    ShareMock.findOne.mockResolvedValue(null);

    await expect(getVisibleDocument(2, null, 4)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("listForUser", () => {
  // Los documentos de listScope pasan por withoutData(), que usa .get({plain}),
  // y listSharedWith lee `document.id` directamente: exponemos ambos.
  const row = (data: Record<string, unknown>) => ({ ...data, get: () => data });

  it("fusiona el ámbito compartido, el personal y los compartidos explícitamente", async () => {
    DocumentMock.findAll.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
      if (Array.isArray(where.id)) {
        return Promise.resolve(
          (where.id as number[]).map((id) => row({ id, name: `conmigo-${id}` })),
        );
      }
      if (where.ownerUserId === 2) return Promise.resolve([row({ id: 10, name: "mio.txt" })]);
      return Promise.resolve([row({ id: 20, name: "empresa.txt" })]);
    });
    FolderMock.findAll.mockResolvedValue([]);
    ShareMock.findAll.mockResolvedValue([
      { documentId: 10, permission: "view" },
      { documentId: 30, permission: "edit" },
    ]);

    const result = await listForUser(2, null);

    expect(result.shared.documents.map((doc) => doc.id)).toEqual([20]);
    const personalIds = result.personal.documents.map((doc) => doc.id);
    expect(personalIds).toContain(10);
    expect(personalIds).toContain(30);
    expect(personalIds).toHaveLength(2);
    const sharedDoc = result.personal.documents.find((doc) => doc.id === 30);
    expect(sharedDoc).toMatchObject({ folderId: null, sharePermission: "edit" });
  });
});

describe("getDocumentContent", () => {
  it("lee el binario desde el bucket cuando hay storageKey", async () => {
    DocumentMock.findByPk.mockResolvedValue(
      docInstance({
        id: 1,
        name: "acta.docx",
        mimeType: "application/msword",
        storageKey: "documents/x.docx",
      }),
    );
    StorageMock.getObjectBuffer.mockResolvedValue(Buffer.from("binario"));

    const result = await getDocumentContent(1);

    expect(StorageMock.getObjectBuffer).toHaveBeenCalledWith("documents/x.docx");
    expect(result.buffer.toString()).toBe("binario");
    expect(result.mimeType).toBe("application/msword");
  });

  it("cae al data URL de los archivos antiguos", async () => {
    DocumentMock.findByPk.mockResolvedValue(
      docInstance({
        id: 2,
        name: "notas.txt",
        mimeType: "text/plain",
        storageKey: null,
        data: "data:text/plain;base64,aGk=",
      }),
    );

    const result = await getDocumentContent(2);

    expect(result.buffer.toString()).toBe("hi");
    expect(StorageMock.getObjectBuffer).not.toHaveBeenCalled();
  });
});

describe("saveDocumentContent", () => {
  it("sube la nueva versión, borra la anterior y bumpea la revisión", async () => {
    const document = docInstance({
      id: 3,
      name: "planilla.xlsx",
      // Sin MIME guardado: el servicio lo deduce de la extensión.
      mimeType: null,
      storageKey: "documents/viejo.xlsx",
      revision: 2,
    });
    DocumentMock.findByPk.mockResolvedValue(document);
    StorageMock.isStorageConfigured.mockReturnValue(true);
    StorageMock.putObject.mockResolvedValue("documents/nuevo.xlsx");

    const result = await saveDocumentContent(3, Buffer.from("v2"), "xlsx");

    expect(StorageMock.putObject).toHaveBeenCalledWith(
      expect.any(Buffer),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "planilla.xlsx",
    );
    expect(StorageMock.deleteObject).toHaveBeenCalledWith("documents/viejo.xlsx");
    expect(document.storageKey).toBe("documents/nuevo.xlsx");
    expect(document.revision).toBe(3);
    expect(document.data).toBeNull();
    expect(result).toMatchObject({ id: 3, revision: 3 });
    expect(result.storageKey).toBeUndefined();
  });

  it("503 si el almacenamiento no está configurado", async () => {
    DocumentMock.findByPk.mockResolvedValue(docInstance({ id: 3, name: "a.docx", revision: 1 }));
    StorageMock.isStorageConfigured.mockReturnValue(false);

    await expect(saveDocumentContent(3, Buffer.from("v"), "docx")).rejects.toMatchObject({
      statusCode: 503,
    });
  });
});

describe("buildOfficeEditor", () => {
  it("arma la config del editor para un archivo de oficina", async () => {
    DocumentMock.findByPk.mockResolvedValue({ id: 9, name: "planilla.xlsx", revision: 4 });
    OnlyOfficeMock.isEditableDocument.mockReturnValue(true);
    OnlyOfficeMock.isOnlyOfficeConfigured.mockReturnValue(true);
    OnlyOfficeMock.getDocumentServerUrl.mockReturnValue("http://ds");
    OnlyOfficeMock.buildEditorConfig.mockReturnValue({ token: "t" });

    const result = await buildOfficeEditor(9, { id: 1, name: "Ana" }, "http://api/api", "edit");

    expect(result).toEqual({ documentServerUrl: "http://ds", config: { token: "t" } });
    expect(OnlyOfficeMock.buildEditorConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 9,
        name: "planilla.xlsx",
        revision: 4,
        userId: 1,
        userName: "Ana",
        apiBaseUrl: "http://api/api",
        mode: "edit",
      }),
    );
  });

  it("400 si el tipo de archivo no se puede editar", async () => {
    DocumentMock.findByPk.mockResolvedValue({ id: 9, name: "foto.png", revision: 1 });
    OnlyOfficeMock.isEditableDocument.mockReturnValue(false);

    await expect(buildOfficeEditor(9, { id: 1, name: "Ana" }, "http://api/api")).rejects.toMatchObject(
      { statusCode: 400 },
    );
  });

  it("503 si el document server no está configurado", async () => {
    DocumentMock.findByPk.mockResolvedValue({ id: 9, name: "acta.docx", revision: 1 });
    OnlyOfficeMock.isEditableDocument.mockReturnValue(true);
    OnlyOfficeMock.isOnlyOfficeConfigured.mockReturnValue(false);

    await expect(buildOfficeEditor(9, { id: 1, name: "Ana" }, "http://api/api")).rejects.toMatchObject(
      { statusCode: 503 },
    );
  });
});
