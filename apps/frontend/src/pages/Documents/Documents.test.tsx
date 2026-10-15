import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../theme";
import DocumentsPage from "./index";

const mockGetDocuments = jest.fn();
const mockGetPersonalDocuments = jest.fn();
const mockDeleteDocument = jest.fn();
const mockDownloadDocument = jest.fn();
const mockBuildDocumentsZip = jest.fn();
const mockShareDocuments = jest.fn();
const mockMoveDocumentItems = jest.fn();
jest.mock("../../services/documentService", () => ({
  getDocuments: (...args: unknown[]) => mockGetDocuments(...args),
  getPersonalDocuments: () => mockGetPersonalDocuments(),
  createDocumentFolder: jest.fn(),
  deleteDocumentFolder: jest.fn(),
  uploadDocument: jest.fn(),
  downloadDocument: (...args: unknown[]) => mockDownloadDocument(...args),
  deleteDocument: (...args: unknown[]) => mockDeleteDocument(...args),
  buildDocumentsZip: (...args: unknown[]) => mockBuildDocumentsZip(...args),
  shareDocuments: (...args: unknown[]) => mockShareDocuments(...args),
  moveDocumentItems: (...args: unknown[]) => mockMoveDocumentItems(...args),
  // El explorador decide si muestra "Editar": misma regla que el servicio real.
  isOfficeDocument: (name: string) => /\.(docx?|xlsx?|pptx?|odt|ods|odp|csv|txt|rtf)$/i.test(name),
  getOfficeEditorConfig: jest.fn(),
}));

const mockGetEmployees = jest.fn();
jest.mock("../../services/employeeService", () => ({
  getEmployees: () => mockGetEmployees(),
}));

const mockUseAuthContext = jest.fn();
jest.mock("../../context/AuthContext", () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock("../../components/Snackbar/Snackbar.component", () => ({
  useAppNotifications: () => ({ showNotification: jest.fn() }),
}));

const personalScope = {
  folders: [],
  documents: [
    {
      id: 1,
      folderId: null,
      ownerEmployeeId: null,
      ownerUserId: 1,
      name: "Personal.txt",
      mimeType: "text/plain",
      size: 10,
    },
  ],
};

const sharedScope = {
  folders: [],
  documents: [
    {
      id: 2,
      folderId: null,
      ownerEmployeeId: null,
      ownerUserId: null,
      name: "Compartido.txt",
      mimeType: "text/plain",
      size: 20,
    },
  ],
};

// Un usuario de gestión SIN empleado vinculado: el caso que impedía tener un
// ámbito "Solo para mí" basado en la ficha de Planilla.
const asManagerWithoutEmployee = () => {
  mockUseAuthContext.mockReturnValue({
    currentUser: { id: 1, employeeId: null, roles: [{ id: 1, name: "Gerencia" }] },
    userPermissions: ["documents:view", "documents:manage"],
  });
};

const renderPage = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <DocumentsPage />
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
  mockGetDocuments.mockReset();
  mockGetPersonalDocuments.mockReset();
  mockGetEmployees.mockReset();
  mockDeleteDocument.mockReset();
  mockDownloadDocument.mockReset();
  mockBuildDocumentsZip.mockReset();
  mockShareDocuments.mockReset();
  mockMoveDocumentItems.mockReset();
  mockGetEmployees.mockResolvedValue([]);
  mockGetDocuments.mockResolvedValue(sharedScope);
  mockGetPersonalDocuments.mockResolvedValue(personalScope);
  mockDeleteDocument.mockResolvedValue(undefined);
  mockDownloadDocument.mockResolvedValue({ id: 2, name: "Compartido.txt", data: "data:text/plain;base64,QQ==" });
  mockBuildDocumentsZip.mockResolvedValue(new Blob());
  mockShareDocuments.mockResolvedValue({ shared: 1 });
  mockMoveDocumentItems.mockResolvedValue({ moved: 1 });
});

describe("DocumentsPage — ámbito por defecto", () => {
  it('abre en "Compartido (toda la empresa)" por defecto', async () => {
    asManagerWithoutEmployee();
    renderPage();

    expect(await screen.findByText("Compartido.txt")).toBeInTheDocument();
    expect(mockGetDocuments).toHaveBeenCalled();
    expect(mockGetPersonalDocuments).not.toHaveBeenCalled();
  });

  it("permite cambiar al ámbito personal", async () => {
    asManagerWithoutEmployee();
    renderPage();

    await screen.findByText("Compartido.txt");
    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: "Solo para mí" }));

    expect(await screen.findByText("Personal.txt")).toBeInTheDocument();
    expect(mockGetPersonalDocuments).toHaveBeenCalled();
  });
});

describe("DocumentsPage — selección múltiple", () => {
  it("muestra la barra de acciones al seleccionar un archivo", async () => {
    asManagerWithoutEmployee();
    renderPage();

    await screen.findByText("Compartido.txt");
    fireEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Compartido.txt" }));

    expect(screen.getByText("1 seleccionado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compartir" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mover" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
  });

  it("descarga el archivo seleccionado", async () => {
    asManagerWithoutEmployee();
    renderPage();

    await screen.findByText("Compartido.txt");
    fireEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Compartido.txt" }));
    fireEvent.click(screen.getByRole("button", { name: "Descargar" }));

    await waitFor(() => expect(mockDownloadDocument).toHaveBeenCalledWith(2));
  });

  it("elimina los archivos seleccionados tras confirmar", async () => {
    asManagerWithoutEmployee();
    renderPage();

    await screen.findByText("Compartido.txt");
    fireEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Compartido.txt" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(mockDeleteDocument).toHaveBeenCalledWith(2));
  });

  it("abre el diálogo de compartir con la selección", async () => {
    asManagerWithoutEmployee();
    renderPage();

    await screen.findByText("Compartido.txt");
    fireEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Compartido.txt" }));
    fireEvent.click(screen.getByRole("button", { name: "Compartir" }));

    expect(await screen.findByRole("heading", { name: "Compartir" })).toBeInTheDocument();
    expect(await screen.findByText("Compartirás \"Compartido.txt\".")).toBeInTheDocument();
  });
});
