import jwt from "jsonwebtoken";
import {
  buildEditorConfig,
  editorUserNameFor,
  getDocumentType,
  getFileType,
  isEditableDocument,
  isOnlyOfficeConfigured,
  isSaveStatus,
  signContentToken,
  verifyCallbackToken,
  verifyContentToken,
} from "../services/onlyofficeService";

const SECRET = "test-onlyoffice-secret-with-enough-length";

beforeEach(() => {
  process.env.ONLYOFFICE_URL = "http://localhost:8081/";
  process.env.ONLYOFFICE_JWT_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.ONLYOFFICE_URL;
  delete process.env.ONLYOFFICE_JWT_SECRET;
});

describe("tipos de archivo", () => {
  it("mapea cada extensión a su tipo de documento", () => {
    expect(getFileType("Informe.DOCX")).toBe("docx");
    expect(getDocumentType("Informe.docx")).toBe("word");
    expect(getDocumentType("planilla.xlsx")).toBe("cell");
    expect(getDocumentType("charla.pptx")).toBe("slide");
    expect(getDocumentType("contrato.pdf")).toBeNull();
    expect(getFileType("sin-extension")).toBe("");
  });

  it("reconoce qué archivos se pueden editar", () => {
    expect(isEditableDocument("acta.odt")).toBe(true);
    expect(isEditableDocument("foto.png")).toBe(false);
  });

  it("detecta si el editor está configurado", () => {
    expect(isOnlyOfficeConfigured()).toBe(true);
    delete process.env.ONLYOFFICE_JWT_SECRET;
    expect(isOnlyOfficeConfigured()).toBe(false);
  });

  it("arma el nombre visible del usuario con respaldo en el username", () => {
    expect(editorUserNameFor("Ana", "Rojas", "arojas")).toBe("Ana Rojas");
    expect(editorUserNameFor(null, null, "arojas")).toBe("arojas");
    expect(editorUserNameFor(null, null, null)).toBe("Usuario");
  });
});

describe("buildEditorConfig", () => {
  const input = {
    documentId: 7,
    name: "Informe.docx",
    revision: 3,
    userId: 5,
    userName: "Ana Rojas",
    apiBaseUrl: "https://api.example.com/api/",
    mode: "edit" as const,
  };

  it("construye la config con el tipo, la clave por revisión y las URLs", () => {
    const config = buildEditorConfig(input) as any;

    expect(config.documentType).toBe("word");
    expect(config.document.fileType).toBe("docx");
    expect(config.document.title).toBe("Informe.docx");
    // La clave cambia con la revisión para invalidar la caché del editor.
    expect(config.document.key).toBe("7-3");
    expect(config.document.url).toContain("/documents/files/7/content?token=");
    expect(config.editorConfig.callbackUrl).toBe(
      "https://api.example.com/api/documents/files/7/callback",
    );
    expect(config.editorConfig.mode).toBe("edit");
    expect(config.document.permissions.edit).toBe(true);
  });

  it("firma la config con el secreto compartido", () => {
    const config = buildEditorConfig(input) as any;
    const decoded = jwt.verify(config.token, SECRET, { algorithms: ["HS256"] }) as any;
    expect(decoded.document.key).toBe("7-3");
    expect(decoded.documentType).toBe("word");
  });

  it("en modo vista el editor queda sin permiso de edición", () => {
    const config = buildEditorConfig({ ...input, mode: "view" }) as any;
    expect(config.editorConfig.mode).toBe("view");
    expect(config.document.permissions.edit).toBe(false);
  });

  it("rechaza un archivo que no es de oficina", () => {
    expect(() => buildEditorConfig({ ...input, name: "foto.png" })).toThrow();
  });
});

describe("token de descarga", () => {
  it("verifica el token y devuelve el id del documento", () => {
    expect(verifyContentToken(signContentToken(42))).toBe(42);
  });

  it("rechaza un token manipulado", () => {
    expect(() => verifyContentToken("no-es-un-token")).toThrow();
  });

  it("rechaza un token con otro propósito", () => {
    const other = jwt.sign({ documentId: 1, purpose: "otro" }, SECRET, { algorithm: "HS256" });
    expect(() => verifyContentToken(other)).toThrow();
  });
});

describe("verifyCallbackToken", () => {
  it("acepta el callback firmado por el document server", () => {
    const payload = { key: "7-3", status: 2, url: "http://ds/url", filetype: "docx" };
    const token = jwt.sign({ payload }, SECRET, { algorithm: "HS256" });

    expect(verifyCallbackToken(`Bearer ${token}`)).toEqual(payload);
  });

  it("rechaza peticiones sin token o con firma inválida", () => {
    expect(() => verifyCallbackToken(undefined)).toThrow();
    expect(() => verifyCallbackToken("Bearer forjado")).toThrow();
    const forged = jwt.sign({ payload: { key: "1", status: 2 } }, "otro-secreto", {
      algorithm: "HS256",
    });
    expect(() => verifyCallbackToken(`Bearer ${forged}`)).toThrow();
  });

  it("solo 2 y 6 entregan el archivo editado", () => {
    expect([1, 3, 4, 7].every((status) => !isSaveStatus(status))).toBe(true);
    expect(isSaveStatus(2)).toBe(true);
    expect(isSaveStatus(6)).toBe(true);
  });
});
