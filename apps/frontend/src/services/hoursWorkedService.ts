import { HoursWorked } from "../models/HoursWorked";
import api, { invalidateCache } from "./api";

export const getHoursWorked = async (dateFrom?: string, dateTo?: string) => {
  const params: Record<string, string | number> = {
    _t: Date.now(),
    limit: 10000,
  };
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  const response = await api.get("/hours-worked", { params });
  return response.data.data;
};

export const getHoursWorkedById = async (id: number) => {
  const response = await api.get(`/hours-worked/${id}`);
  return response.data;
};

export const createHoursWorked = async (newHoursWorked: Omit<HoursWorked, "id">) => {
  const response = await api.post("/hours-worked", newHoursWorked);
  invalidateCache("/hours-worked");
  return response.data;
};

export const updateHoursWorked = async (
  id: number,
  updatedHoursWorked: Partial<HoursWorked>,
) => {
  const response = await api.put(`/hours-worked/${id}`, updatedHoursWorked);
  invalidateCache("/hours-worked");
  return response.data;
};

export const deleteHoursWorked = async (id: number) => {
  const response = await api.delete(`/hours-worked/${id}`);
  invalidateCache("/hours-worked");
  return { id, message: response.data };
};

// Server-side recalculation of weekly / biweekly / monthly summaries from the
// hours_worked records (source of truth). With `date` it recomputes only the
// periods covering that day; with only `employeeId` all of the employee's
// periods; with neither, the current month's periods for every employee.
export const recalculateSummaries = async (body: {
  employeeId?: number;
  date?: string;
}) => {
  const response = await api.post("/hours-worked/recalculate", body);
  invalidateCache("/hours-worked");
  invalidateCache("/weekly-summary");
  invalidateCache("/biweekly-summary");
  invalidateCache("/monthly-summary");
  return response.data;
};
