import { MyPanelOverview } from "../models/MyPanel";
import { Vacation } from "../models/Vacation";
import api, { invalidateCache } from "./api";

// Panel personal. Todo se resuelve en el servidor a partir de la sesión
// (users.employeeId), así que no se envían ids de empleado desde el cliente.
export const getMyOverview = async (): Promise<MyPanelOverview> => {
  const response = await api.get("/me/overview", { params: { _t: Date.now() } });
  return response.data;
};

// Solicitud de vacaciones del propio empleado (queda pendiente de aprobación).
export const createMyVacation = async (input: {
  startDate: string;
  endDate: string;
  reason?: string | null;
}): Promise<Vacation> => {
  const response = await api.post("/me/vacations", input);
  invalidateCache("/vacations");
  invalidateCache("/me/overview");
  return response.data;
};
