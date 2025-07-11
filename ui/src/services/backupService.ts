import api from "./api";

/**
 * Elimina todos los datos de tablas NO CORE (vehicles, hours_worked, weekly_summary, monthly_summary, biweekly_summary, etc.)
 * No elimina: employees, permissions, role_permission, roles, schedule, user_role, users
 */
export const deleteAllExceptCoreTables = async () => {
  // The order matters to avoid FK errors
  await api.delete("/hours-worked/bulk"); // Delete all hours worked (bulk)
  await api.delete("/weekly-summary/bulk"); // Delete all weekly summaries (bulk)
  await api.delete("/monthly-summary/bulk"); // Delete all monthly summaries (bulk)
  await api.delete("/biweekly-summary/bulk"); // Delete all biweekly summaries (bulk)
  await api.delete("/vehicles/bulk"); // Delete all vehicles (bulk)
  // Add other bulk delete endpoints here if they exist
}; 