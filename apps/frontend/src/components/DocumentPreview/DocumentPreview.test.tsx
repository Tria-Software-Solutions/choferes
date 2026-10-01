import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../theme";
import DocumentPreview, { getPreviewKind, triggerDownload } from "./DocumentPreview.component";
import type { DocumentDTO } from "../../services/documentService";

const mockDownloadDocument = jest.fn();
jest.mock("../../services/documentService", () => ({
  downloadDocument: (id: number) => mockDownloadDocument(id),
}));

const baseDoc = (overrides: Partial<DocumentDTO> = {}): DocumentDTO => ({
  id: 10,
  folderId: null,
  ownerEmployeeId: null,
  name: "archivo.pdf",
  mimeType: "application/pdf",
  size: 2048,
  ...overrides,
});

const renderPreview = (doc: DocumentDTO | null, onClose = jest.fn()) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <DocumentPreview open doc={doc} onClose={onClose} />
    </ThemeProvider>,
  );

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  mockDownloadDocument.mockReset();
});

describe("getPreviewKind", () => {
  it("elige el visor según el MIME", () => {
    expect(getPreviewKind("image/png")).toBe("image");
    expect(getPreviewKind("image/webp")).toBe("image");
    expect(getPreviewKind("application/pdf")).toBe("pdf");
    expect(getPreviewKind("video/mp4")).toBe("video");
    expect(getPreviewKind("audio/mpeg")).toBe("audio");
    expect(getPreviewKind("text/csv")).toBe("text");
    expect(getPreviewKind("application/json")).toBe("text");
    expect(
      getPreviewKind("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ).toBe("unsupported");
  });

  it("usa la extensión cuando el MIME vino vacío", () => {
    expect(getPreviewKind(null, "contrato.pdf")).toBe("pdf");
    expect(getPreviewKind(null, "notas.txt")).toBe("text");
    expect(getPreviewKind(undefined, "informe.docx")).toBe("unsupported");
    expect(getPreviewKind(null, "manual")).toBe("unsupported");
  });

  it("ignora los parámetros del MIME", () => {
    expect(getPreviewKind("image/jpeg; charset=binary")).toBe("image");
  });
});

describe("triggerDownload", () => {
  it("descarga una data URL válida", () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    triggerDownload("data:text/plain;base64,aG8=", "notas.txt");
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  // Un `javascript:` en el href se ejecutaría en la sesión de quien hace clic.
  it("no descarga esquemas no data URL", () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    triggerDownload("javascript:alert(1)", "trampa.txt");
    triggerDownload("https://ejemplo.com/archivo.pdf", "remoto.pdf");
    triggerDownload(undefined, "vacio.txt");
    expect(click).not.toHaveBeenCalled();
    click.mockRestore();
  });
});

describe("DocumentPreview", () => {
  it("muestra nombre, tamaño y MIME del documento", async () => {
    mockDownloadDocument.mockResolvedValue(
      baseDoc({ data: "data:application/pdf;base64,JVBERi0xLjQ=" }),
    );
    renderPreview(baseDoc());

    expect(await screen.findByRole("heading", { name: "archivo.pdf" })).toBeInTheDocument();
    expect(screen.getByText("2 KB · application/pdf")).toBeInTheDocument();
  });

  it("renderiza la imagen cuando el archivo es de tipo imagen", async () => {
    mockDownloadDocument.mockResolvedValue(
      baseDoc({ name: "foto.png", mimeType: "image/png", data: "data:image/png;base64,iVBORw0KGgo=" }),
    );
    renderPreview(baseDoc({ name: "foto.png", mimeType: "image/png" }));

    expect(await screen.findByRole("img", { name: "foto.png" })).toBeInTheDocument();
  });

  it("avisa y ofrece descargar cuando el tipo no se puede previsualizar", async () => {
    const doc = baseDoc({
      name: "informe.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      data: undefined,
    });
    mockDownloadDocument.mockResolvedValue({
      ...doc,
      data: "data:application/octet-stream;base64,UEsDBA==",
    });
    renderPreview(doc);

    expect(
      await screen.findByText("No se puede previsualizar este tipo de archivo"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Descargar/ })).toBeEnabled();
  });

  it("muestra un estado de error si el archivo no se pudo cargar", async () => {
    mockDownloadDocument.mockRejectedValue(new Error("404"));
    renderPreview(baseDoc());

    expect(await screen.findByText("No se pudo cargar el documento")).toBeInTheDocument();
  });
});
