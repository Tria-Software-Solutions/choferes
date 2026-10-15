import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../theme";
import type { DocumentDTO } from "../../services/documentService";
import OfficeEditor from "./OfficeEditor.component";

const mockGetOfficeEditorConfig = jest.fn();
jest.mock("../../services/documentService", () => ({
  getOfficeEditorConfig: (id: number) => mockGetOfficeEditorConfig(id),
}));

const DS = "http://ds.local";

const doc = (overrides: Partial<DocumentDTO> = {}): DocumentDTO => ({
  id: 9,
  folderId: null,
  ownerEmployeeId: null,
  name: "Informe.docx",
  mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  size: 2048,
  ...overrides,
});

// Simula el document server ya cargado: existe el script con la misma URL y la
// API global, así el componente no tiene que esperar una descarga real.
const prepareApi = () => {
  const script = document.createElement("script");
  script.id = "onlyoffice-api-script";
  script.src = `${DS}/web-apps/apps/api/documents/api.js`;
  document.body.appendChild(script);
  const destroyEditor = jest.fn();
  const DocEditor = jest.fn((_id: string, _config: Record<string, unknown>) => ({ destroyEditor }));
  (window as unknown as { DocsAPI?: unknown }).DocsAPI = { DocEditor };
  return { DocEditor, destroyEditor };
};

const renderEditor = (onClose = jest.fn(), onSaved = jest.fn()) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <OfficeEditor open doc={doc()} onClose={onClose} onSaved={onSaved} />
    </ThemeProvider>,
  );

beforeEach(() => {
  mockGetOfficeEditorConfig.mockReset();
  document.body.innerHTML = "";
  delete (window as unknown as { DocsAPI?: unknown }).DocsAPI;
  mockGetOfficeEditorConfig.mockResolvedValue({
    documentServerUrl: DS,
    config: { documentType: "word", token: "t" },
  });
});

describe("OfficeEditor", () => {
  it("monta el editor cuando llega la config", async () => {
    const { DocEditor } = prepareApi();

    renderEditor();

    await waitFor(() => expect(DocEditor).toHaveBeenCalledTimes(1));
    // Se monta en el placeholder identificado con el id del archivo.
    expect(String(DocEditor.mock.calls[0][0])).toBe("onlyoffice-9");
    const config = DocEditor.mock.calls[0][1];
    expect(config.documentType).toBe("word");
    expect(config).toHaveProperty("events");
  });

  it("avisa si no se pudo abrir el editor", async () => {
    prepareApi();
    mockGetOfficeEditorConfig.mockRejectedValue(new Error("503"));

    renderEditor();

    expect(
      await screen.findByText("No se pudo abrir el editor de oficina"),
    ).toBeInTheDocument();
  });

  it("al cerrar recarga el listado y notifica el cierre", async () => {
    prepareApi();
    const onClose = jest.fn();
    const onSaved = jest.fn();

    renderEditor(onClose, onSaved);

    fireEvent.click(await screen.findByRole("button", { name: "Cerrar" }));

    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
