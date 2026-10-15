import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../../theme";

import EmployeesPage from "./index";

// Empleados del store: `employees` llega filtrado por el servidor (por defecto
// "Activos"), `allEmployees` es la plantilla completa.
const active = (id: number) => ({
  id,
  firstName: `Activo${id}`,
  lastName: "Prueba",
  email: `activo${id}@example.com`,
  isActive: true,
  hourlyRate: 100,
  vacationDays: 5,
  avatar: null,
  scheduledTerminationDate: null,
});
const inactive = (id: number) => ({ ...active(id), firstName: `Inactivo${id}`, isActive: false });

let mockState: unknown;

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
  useDispatch: () => (action: unknown) => {
    mockDispatch(action);
    const promise = Promise.resolve(action);
    return promise;
  },
}));

const mockUseAuthContext = jest.fn();
jest.mock("../../../context/AuthContext", () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/employees" }),
  useNavigate: () => jest.fn(),
}));

// El slice de licencias solo alimenta las alertas de la 4ª tarjeta.
jest.mock("../../../store/slices/licenseSlice", () => ({
  fetchLicenses: jest.fn(),
  selectLicenses: () => [],
}));

// Thunks de empleados: no se ejecutan; basta con que existan.
jest.mock("../../../store/slices/employeeSlice", () => ({
  fetchEmployees: jest.fn(),
  fetchAllEmployees: jest.fn(),
  createEmployee: jest.fn(),
  updateEmployeeAvatar: jest.fn(),
  removeEmployeeAvatar: jest.fn(),
}));

jest.mock("../../../components/Snackbar/Snackbar.component", () => ({
  useAppNotifications: () => ({ showNotification: jest.fn() }),
}));

// Se reemplazan los hijos pesados: aquí solo importan las tarjetas KPI.
jest.mock("../../../components/Table/StickyDataGrid/StickyDataGrid.component", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../../../components/ExportMenu/ExportMenu.component", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../../Forms/AddEmployeeForm", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("./EmployeeMobileList", () => ({
  __esModule: true,
  default: () => null,
}));

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
  mockDispatch.mockClear();
  localStorage.clear();
  mockUseAuthContext.mockReturnValue({ userPermissions: [] });
});

const setEmployees = (roster: unknown[]) => {
  // El store visible trae solo los activos, como hace el backend con el filtro.
  mockState = {
    employees: {
      employees: roster.filter((employee) => (employee as { isActive: boolean }).isActive),
      allEmployees: roster,
      isLoadingEmployees: false,
    },
  };
};

const renderPage = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <EmployeesPage />
    </ThemeProvider>,
  );

describe("EmployeesPage — tarjeta de Empleados", () => {
  // El filtro de estado por defecto es "Activos": si el hint se calculara sobre
  // las filas visibles daría "0 inactivos" aunque la plantilla tenga inactivos.
  it("cuenta los inactivos de toda la plantilla, no solo de las filas visibles", () => {
    setEmployees([active(1), active(2), active(3), inactive(4), inactive(5)]);

    renderPage();

    expect(screen.getByText("2 inactivos")).toBeInTheDocument();
    expect(screen.queryByText("0 inactivos")).not.toBeInTheDocument();
  });

  it("usa el singular cuando hay un solo inactivo", () => {
    setEmployees([active(1), inactive(2)]);

    renderPage();

    expect(screen.getByText("1 inactivo")).toBeInTheDocument();
  });
});
