import request from "supertest";
import express from "express";

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn(
    (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      (req as any).user = { id: 1, roles: ["*"], permissions: ["*"] };
      next();
    },
  ),
}));

jest.mock("../middleware/authorize", () => {
  const pass = () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
    next();
  return {
    requirePermission: jest.fn(pass),
    requireAnyPermission: jest.fn(pass),
    requireRole: jest.fn(pass),
    allowSelfOrPermission: jest.fn(pass),
    allowSelfWithPermission: jest.fn(pass),
    getUserId: (req: express.Request) => (req as any).user?.id,
  };
});

// El controller usa el modelo User solo para el nombre del editor.
jest.mock("../models/User", () => ({ User: { findByPk: jest.fn() } }));

// Integración con el document server (JWT y estados del callback).
jest.mock("../services/onlyofficeService", () => ({
  verifyContentToken: jest.fn(),
  verifyCallbackToken: jest.fn(),
  isSaveStatus: jest.fn(),
  editorUserNameFor: jest.fn(() => "Ana Rojas"),
}));

// Mock the service layer
jest.mock("../services/documentService", () => ({
  getDocuments: jest.fn(),
  createFolder: jest.fn(),
  deleteFolder: jest.fn(),
  uploadDocument: jest.fn(),
  downloadDocument: jest.fn(),
  deleteDocument: jest.fn(),
  shareDocuments: jest.fn(),
  listShares: jest.fn(),
  removeShare: jest.fn(),
  moveItems: jest.fn(),
  getDocumentContent: jest.fn(),
  saveDocumentContent: jest.fn(),
  buildOfficeEditor: jest.fn(),
  resolveOwner: jest.fn((input: { ownerEmployeeId?: unknown }) => ({
    ownerEmployeeId: input.ownerEmployeeId ?? null,
    ownerUserId: null,
  })),
  userOwner: jest.fn((id: number) => ({ ownerEmployeeId: null, ownerUserId: id })),
  resolveOwnerForTest: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const documentService = require("../services/documentService");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const onlyofficeService = require("../services/onlyofficeService");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const userModel = require("../models/User");
import documentRoutes from "../routes/documentRoutes";
import { createTestApp } from "./helpers/testApp";
import { ServiceError } from "../utils/errors";

const app = createTestApp("/api/documents", documentRoutes);
const service = documentService as any;
const onlyoffice = onlyofficeService as any;
const userMock = userModel.User as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
  userMock.findByPk.mockResolvedValue({
    id: 1,
    firstName: "Ana",
    lastName: "Rojas",
    username: "arojas",
  });
});

describe("POST /api/documents/shares", () => {
  it("comparte varios archivos con varios destinatarios", async () => {
    service.shareDocuments.mockResolvedValue({ shared: 4 });

    const res = await request(app)
      .post("/api/documents/shares")
      .send({
        documentIds: [1, 2],
        recipients: [
          { type: "employee", id: 7 },
          { type: "user", id: 3 },
        ],
        permission: "edit",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ shared: 4 });
    expect(service.shareDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        documentIds: [1, 2],
        permission: "edit",
        userId: 1,
      }),
    );
  });

  it("traduce un ServiceError del service al status correcto", async () => {
    service.shareDocuments.mockRejectedValue(new ServiceError(404, "Algún archivo no existe"));

    const res = await request(app)
      .post("/api/documents/shares")
      .send({ documentIds: [999], recipients: [{ type: "user", id: 1 }] });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Algún archivo no existe");
  });
});

describe("GET /api/documents/files/:id/shares", () => {
  it("devuelve los destinatarios", async () => {
    service.listShares.mockResolvedValue([{ id: 1, recipientName: "Ana Pérez" }]);

    const res = await request(app).get("/api/documents/files/5/shares");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(service.listShares).toHaveBeenCalledWith(5);
  });
});

describe("DELETE /api/documents/shares/:id", () => {
  it("quita un destinatario", async () => {
    service.removeShare.mockResolvedValue(true);

    const res = await request(app).delete("/api/documents/shares/3");

    expect(res.status).toBe(204);
    expect(service.removeShare).toHaveBeenCalledWith(3);
  });
});

describe("GET /api/documents/files/:id/office-config", () => {
  it("devuelve la config firmada del editor", async () => {
    service.buildOfficeEditor.mockResolvedValue({
      documentServerUrl: "http://ds",
      config: { documentType: "word" },
    });

    const res = await request(app).get("/api/documents/files/9/office-config");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ documentServerUrl: "http://ds", config: { documentType: "word" } });
    expect(service.buildOfficeEditor).toHaveBeenCalledWith(
      9,
      { id: 1, name: "Ana Rojas" },
      expect.any(String),
      "edit",
    );
  });
});

describe("GET /api/documents/files/:id/content", () => {
  it("sirve el binario cuando el token es válido", async () => {
    onlyoffice.verifyContentToken.mockReturnValue(9);
    service.getDocumentContent.mockResolvedValue({
      buffer: Buffer.from("contenido"),
      mimeType: "text/plain",
      name: "notas.txt",
    });

    const res = await request(app).get("/api/documents/files/9/content?token=abc");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.text).toBe("contenido");
  });

  it("rechaza un token que no corresponde al archivo", async () => {
    onlyoffice.verifyContentToken.mockReturnValue(4);

    const res = await request(app).get("/api/documents/files/9/content?token=abc");

    expect(res.status).toBe(403);
    expect(service.getDocumentContent).not.toHaveBeenCalled();
  });
});

describe("POST /api/documents/files/:id/callback", () => {
  it("guarda el archivo editado y responde { error: 0 }", async () => {
    onlyoffice.verifyCallbackToken.mockReturnValue({
      key: "9-1",
      status: 2,
      url: "http://ds/edited.docx",
      filetype: "docx",
    });
    onlyoffice.isSaveStatus.mockReturnValue(true);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode("editado").buffer,
    }) as unknown as typeof fetch;
    service.saveDocumentContent.mockResolvedValue({ id: 9, revision: 2 });

    const res = await request(app).post("/api/documents/files/9/callback").send({ status: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: 0 });
    expect(service.saveDocumentContent).toHaveBeenCalledWith(9, expect.any(Buffer), "docx");
  });

  it("responde sin guardar si el documento solo se cerró sin cambios", async () => {
    onlyoffice.verifyCallbackToken.mockReturnValue({ key: "9-1", status: 4 });
    onlyoffice.isSaveStatus.mockReturnValue(false);

    const res = await request(app).post("/api/documents/files/9/callback").send({ status: 4 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: 0 });
    expect(service.saveDocumentContent).not.toHaveBeenCalled();
  });
});

describe("POST /api/documents/move", () => {
  it("mueve los elementos resolviendo el ámbito", async () => {
    service.moveItems.mockResolvedValue({ moved: 3 });

    const res = await request(app)
      .post("/api/documents/move")
      .send({ documentIds: [1, 2], folderIds: [9], targetFolderId: 4 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ moved: 3 });
    expect(service.moveItems).toHaveBeenCalledWith(
      expect.objectContaining({
        documentIds: [1, 2],
        folderIds: [9],
        targetFolderId: 4,
        owner: { ownerEmployeeId: null, ownerUserId: null },
      }),
    );
  });
});
