import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../theme";
import type { MyPanelOverview, MyPanelWeek, MyPanelWeekDay } from "../../models/MyPanel";
import { toISODate } from "./panelModel";
import MyPanel from ".";

const mockGetMyOverview = jest.fn();
const mockNavigate = jest.fn();
const mockSetSearchParams = jest.fn();
let mockInitialSearch = "";

// react-router-dom v7 no se resuelve bajo el Jest de CRA; el panel solo usa
// dos hooks, así que se simulan: la pestaña activa se lee de `?tab=` y cada
// cambio queda registrado en `mockSetSearchParams`.
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => {
    const react = require("react");
    const [params, setParams] = react.useState(() => new URLSearchParams(mockInitialSearch));
    const update = (next: Record<string, string>, options?: { replace?: boolean }) => {
      mockSetSearchParams(next, options);
      setParams(new URLSearchParams(next));
    };
    return [params, update];
  },
}));

jest.mock("../../context/AuthContext", () => ({
  useAuthContext: () => ({
    currentUser: { id: 1, firstName: "Carlos", lastName: "Mora", roles: [{ id: 4, name: "Usuario" }] },
    userPermissions: [],
  }),
}));

jest.mock("../../services/meService", () => ({
  getMyOverview: () => mockGetMyOverview(),
  createMyVacation: jest.fn(),
}));

// Las gráficas (recharts), el comprobante de pago y el diálogo de solicitud
// tienen sus propias dependencias pesadas; aquí solo importa la estructura.
jest.mock("./components/PanelCharts", () => ({
  WeeklyHistoryChart: () => null,
  PaymentsChart: () => null,
}));

jest.mock("../EmployeeDetail/components/PaymentBoletaDialog", () => ({
  __esModule: true,
  default: () => null,
  PAYMENT_STATUS: {
    pending: { label: "Pendiente", tone: "warning" },
    sent: { label: "Enviada", tone: "success" },
    cancelled: { label: "Cancelada", tone: "default" },
  },
}));

jest.mock("./components/MyVacationRequestDialog", () => ({
  MyVacationRequestDialog: ({ open }: { open: boolean }) =>
    open ? require("react").createElement("div", { role: "dialog" }, "Solicitar vacaciones") : null,
}));

const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Semana de lunes a domingo (a partir de `offset` días desde el lunes de la
// semana en curso): lun-sáb en "Avenida 123", domingo libre. `holeToday` deja
// sin lugar el día de hoy.
const weekFrom = (offsetDays: number, holeToday = false): MyPanelWeek => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offsetDays);
  const days: MyPanelWeekDay[] = DAY_NAMES.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const iso = toISODate(date);
    const isToday = iso === toISODate(today);
    // Lun-sáb, y siempre hoy (para que la prueba no dependa del día en que corre).
    const assigned = (index < 6 || isToday) && !(holeToday && isToday);
    return {
      date: iso,
      day,
      hours: assigned ? 8 : 0,
      scheduleId: assigned ? 3 : null,
      scheduleLabel: assigned ? "Avenida 123" : null,
    };
  });
  return {
    weekNumber: 40 + offsetDays / 7,
    year: 2026,
    startDate: days[0].date,
    endDate: days[6].date,
    totalHours: days.reduce((sum, day) => sum + day.hours, 0),
    days,
  };
};

// La misma semana sin ningún lugar asignado.
const withoutPlaces = (week: MyPanelWeek): MyPanelWeek => ({
  ...week,
  totalHours: 0,
  days: week.days.map((day) => ({ ...day, hours: 0, scheduleId: null, scheduleLabel: null })),
});

const linkedOverview = (partial: Partial<MyPanelOverview> = {}): MyPanelOverview => ({
  linked: true,
  employee: {
    id: 7,
    firstName: "Carlos",
    lastName: "Mora",
    email: "carlos@example.com",
    position: "chofer",
    gender: "Masculino",
    contractStartDate: "2022-03-14",
    vacationDays: 8,
  },
  week: weekFrom(0),
  nextWeek: weekFrom(7),
  vacationAccrual: {
    contractStartDate: "2022-03-14",
    referenceDate: toISODate(new Date()),
    accruedDays: 18,
    takenDays: 10,
    availableDays: 8,
    weeksWorked: 235,
    currentBalance: 8,
  },
  vacations: [],
  disciplinaryActions: [],
  licenses: [],
  payments: [],
  tasks: [],
  summaries: { weekly: null, biweekly: null, monthly: null },
  history: { weekly: [] },
  ...partial,
});

const renderPanel = (search = "") => {
  mockInitialSearch = search;
  return render(
    <ThemeProvider theme={lightTheme}>
      <MyPanel />
    </ThemeProvider>,
  );
};

const selectedTab = (): string | null | undefined =>
  screen.getAllByRole("tab").find((tab) => tab.getAttribute("aria-selected") === "true")?.textContent;

describe("MyPanel", () => {
  beforeAll(() => {
    // Movimiento reducido: las cifras y los medidores muestran su valor final al instante.
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
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
    mockGetMyOverview.mockReset();
    mockNavigate.mockReset();
    mockSetSearchParams.mockReset();
  });

  it("abre en Resumen con el saludo, el turno de hoy y las cinco pestañas", async () => {
    mockGetMyOverview.mockResolvedValue(linkedOverview());
    renderPanel();

    expect(await screen.findByRole("heading", { level: 2, name: "Avenida 123" })).toBeInTheDocument();
    expect(screen.getByText(/^Lugar de hoy ·/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Buen(os días|as tardes|as noches), Carlos$/);
    expect(screen.getByText("Hoy: Avenida 123")).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Resumen",
      "Horas",
      "Vacaciones",
      "Pagos",
      "Expediente",
    ]);
    expect(selectedTab()).toBe("Resumen");
    expect(screen.getByText("Todo al día: no tienes avisos pendientes.")).toBeInTheDocument();
  });

  it("sin lugar asignado hoy lo avisa y muestra el próximo turno", async () => {
    mockGetMyOverview.mockResolvedValue(linkedOverview({ week: weekFrom(0, true) }));
    renderPanel();

    expect(await screen.findByRole("heading", { level: 2, name: "Hoy no tienes lugar asignado" })).toBeInTheDocument();
    expect(screen.getByText("Próximo turno")).toBeInTheDocument();
    expect(screen.getByText("Hoy: sin lugar asignado")).toBeInTheDocument();
  });

  it("sin lugares asignados en ninguna semana explica cuándo aparecerán", async () => {
    mockGetMyOverview.mockResolvedValue(
      linkedOverview({ week: withoutPlaces(weekFrom(0)), nextWeek: withoutPlaces(weekFrom(7)) }),
    );
    renderPanel();

    expect(await screen.findByRole("heading", { level: 2, name: "Aún no tienes lugares asignados" })).toBeInTheDocument();
    expect(screen.getByText("Sin lugares asignados")).toBeInTheDocument();
  });

  it("abre la pestaña que indica la URL", async () => {
    mockGetMyOverview.mockResolvedValue(linkedOverview());
    renderPanel("tab=vacaciones");

    expect(await screen.findByText("Mi saldo")).toBeInTheDocument();
    expect(selectedTab()).toBe("Vacaciones");
  });

  it("ignora una pestaña desconocida y vuelve a Resumen", async () => {
    mockGetMyOverview.mockResolvedValue(linkedOverview());
    renderPanel("tab=admin");

    expect(await screen.findByRole("heading", { level: 2, name: "Avenida 123" })).toBeInTheDocument();
    expect(selectedTab()).toBe("Resumen");
  });

  it("cambiar de pestaña actualiza la URL y el contenido", async () => {
    mockGetMyOverview.mockResolvedValue(linkedOverview());
    renderPanel();
    await screen.findByRole("tablist");

    fireEvent.click(screen.getByRole("tab", { name: "Expediente" }));
    expect(await screen.findByText("Datos personales")).toBeInTheDocument();
    expect(mockSetSearchParams).toHaveBeenLastCalledWith({ tab: "expediente" }, { replace: true });

    fireEvent.click(screen.getByRole("tab", { name: "Resumen" }));
    expect(await screen.findByRole("heading", { level: 2, name: "Avenida 123" })).toBeInTheDocument();
    expect(mockSetSearchParams).toHaveBeenLastCalledWith({}, { replace: true });
  });

  it("los avisos llevan a la pestaña o a la página correspondiente", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    mockGetMyOverview.mockResolvedValue(
      linkedOverview({
        licenses: [
          { id: 1, employeeId: 7, licenseType: "B1", status: "por_vencer", daysUntilExpiry: 18, expiresAt: "2026-10-16" },
        ],
        tasks: [
          {
            id: 1,
            userId: 1,
            listId: null,
            title: "Entregar reporte",
            notes: null,
            dueDate: toISODate(yesterday),
            dueTime: null,
            remindAt: null,
            reminderSentAt: null,
            priority: 3,
            isImportant: false,
            recurrence: "none",
            subtasks: [],
            position: 0,
            completedAt: null,
            createdAt: "",
            updatedAt: "",
          },
        ],
      }),
    );
    renderPanel();

    fireEvent.click(await screen.findByRole("button", { name: /Licencia B1 vence en 18 días/ }));
    expect(await screen.findByText("Licencias de conducir")).toBeInTheDocument();
    expect(selectedTab()).toBe("Expediente");

    fireEvent.click(screen.getByRole("tab", { name: /Resumen/ }));
    fireEvent.click(await screen.findByRole("button", { name: /1 tarea vencida/ }));
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  it("marca con un aviso accesible las pestañas que requieren atención", async () => {
    mockGetMyOverview.mockResolvedValue(
      linkedOverview({
        vacations: [
          { id: 1, employeeId: 7, startDate: "2026-10-19", endDate: "2026-10-23", daysRequested: 5, status: "pending" },
        ],
        licenses: [{ id: 1, employeeId: 7, licenseType: "B1", status: "vencida" }],
      }),
    );
    renderPanel();

    expect(await screen.findByRole("tab", { name: "Vacaciones, solicitud en revisión" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Expediente, licencia vencida" })).toBeInTheDocument();
  });

  it("sin empleado vinculado explica qué hacer y no muestra pestañas", async () => {
    mockGetMyOverview.mockResolvedValue({
      linked: false,
      vacations: [],
      disciplinaryActions: [],
      licenses: [],
      payments: [],
      tasks: [],
      summaries: { weekly: null, biweekly: null, monthly: null },
      history: { weekly: [] },
    });
    renderPanel();

    expect(await screen.findByText("Tu cuenta no está vinculada a un empleado")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("ante un error permite reintentar", async () => {
    mockGetMyOverview.mockRejectedValueOnce(new Error("boom")).mockResolvedValue(linkedOverview());
    renderPanel();

    expect(await screen.findByText("Algo salió mal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("heading", { level: 2, name: "Avenida 123" })).toBeInTheDocument();
    expect(mockGetMyOverview).toHaveBeenCalledTimes(2);
  });

  it("solicitar vacaciones abre el diálogo de solicitud", async () => {
    mockGetMyOverview.mockResolvedValue(linkedOverview());
    renderPanel("tab=vacaciones");

    fireEvent.click(await screen.findByRole("button", { name: "Solicitar vacaciones" }));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Solicitar vacaciones");
  });
});
