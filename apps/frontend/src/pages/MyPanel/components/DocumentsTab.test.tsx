import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../../theme";
import { DocumentsTab } from "./DocumentsTab";

const mockGetMyDocuments = jest.fn();
const mockDownloadMyDocument = jest.fn();
jest.mock("../../../services/documentService", () => ({
  getMyDocuments: () => mockGetMyDocuments(),
  downloadMyDocument: (id: number) => mockDownloadMyDocument(id),
}));

const mockUseAuthContext = jest.fn();
jest.mock("../../../context/AuthContext", () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock("../../../components/Snackbar/Snackbar.component", () => ({
  useAppNotifications: () => ({ showNotification: jest.fn() }),
}));

const myDocuments = {
  shared: {
    folders: [],
    documents: [
      {
        id: 1,
        folderId: null,
        ownerEmployeeId: null,
        name: "Reglamento interno.pdf",
        mimeType: "application/pdf",
        size: 1024,
      },
    ],
  },
  personal: {
    folders: [],
    documents: [
      {
        id: 2,
        folderId: null,
        ownerEmployeeId: 7,
        name: "Contrato laboral.pdf",
        mimeType: "application/pdf",
        size: 2048,
      },
    ],
  },
};

const asUser = (roleName: string) => {
  mockUseAuthContext.mockReturnValue({
    currentUser: { id: 1, roles: [{ id: 6, name: roleName }] },
    userPermissions: [],
  });
};

const renderTab = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <DocumentsTab />
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
  mockGetMyDocuments.mockReset();
  mockDownloadMyDocument.mockReset();
  mockGetMyDocuments.mockResolvedValue(myDocuments);
});

describe("DocumentsTab — vista de empleado", () => {
  it("muestra una sola sección con dos tabs", async () => {
    asUser("Chofer");
    renderTab();

    expect(
      await screen.findByRole("heading", { level: 6, name: "Documentos" }),
    ).toBeInTheDocument();
    const group = screen.getByRole("radiogroup", { name: "Ámbito de documentos" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Documentos compartidos" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Tus documentos" })).toHaveAttribute(
      "aria-checked",
      "false",
    );

    // Solo el ámbito activo está renderizado.
    expect(screen.getByText("Reglamento interno.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Contrato laboral.pdf")).not.toBeInTheDocument();
  });

  it("al cambiar de tab muestra los documentos propios", async () => {
    asUser("Recepcionista");
    renderTab();

    expect(await screen.findByText("Reglamento interno.pdf")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Tus documentos" }));

    expect(screen.getByText("Contrato laboral.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Reglamento interno.pdf")).not.toBeInTheDocument();
  });

  // El empleado no tiene `documents:view`: si descargara por el endpoint de
  // administración obtendría 403, así que debe usar el de autoservicio.
  it("descarga a través del endpoint de autoservicio", async () => {
    asUser("Chofer");
    mockDownloadMyDocument.mockResolvedValue({
      ...myDocuments.shared.documents[0],
      data: "data:application/pdf;base64,JVBERi0xLjQ=",
    });
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    renderTab();
    fireEvent.click(
      await screen.findByRole("button", { name: "Descargar Reglamento interno.pdf" }),
    );

    await waitFor(() => expect(mockDownloadMyDocument).toHaveBeenCalledWith(1));
    await waitFor(() => expect(click).toHaveBeenCalled());
    click.mockRestore();
  });

  it("vale también para Supervisor y Chofer Coordinador", async () => {
    asUser("Chofer Coordinador");
    renderTab();

    expect(
      await screen.findByRole("heading", { level: 6, name: "Documentos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Ámbito de documentos" })).toBeInTheDocument();
  });
});

describe("DocumentsTab — vista de gestión", () => {
  it("apila compartidos y propios en dos secciones", async () => {
    asUser("Gerencia");
    renderTab();

    expect(
      await screen.findByRole("heading", { level: 6, name: "Documentos compartidos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 6, name: "Mis documentos" })).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Ámbito de documentos" })).not.toBeInTheDocument();

    expect(screen.getByText("Reglamento interno.pdf")).toBeInTheDocument();
    expect(screen.getByText("Contrato laboral.pdf")).toBeInTheDocument();
  });

  it("también apila las dos secciones para Administrativo y SysAdmin", async () => {
    asUser("Administrativo");
    renderTab();

    expect(
      await screen.findByRole("heading", { level: 6, name: "Documentos compartidos" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Ámbito de documentos" })).not.toBeInTheDocument();
  });
});
