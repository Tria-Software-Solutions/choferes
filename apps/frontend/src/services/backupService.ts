import api from "./api";

/**
 * Deletes all data from NON-CORE tables (vehicles, hours_worked, weekly_summary, monthly_summary, biweekly_summary, etc.)
 * Does not delete: employees, permissions, role_permission, roles, schedule, user_role, users
 */
export const deleteAllExceptCoreTables = async () => {
  // 1. Delete all hours worked
  const hoursWorked = await api.get("/hours-worked");
  for (const hw of hoursWorked.data) {
    await api.delete(`/hours-worked/${hw.id}`);
  }

  // 2. Delete all weekly summaries
  const weeklySummaries = await api.get("/weekly-summary");
  for (const ws of weeklySummaries.data) {
    await api.delete(`/weekly-summary/${ws.id}`);
  }

  // 3. Delete all monthly summaries
  const monthlySummaries = await api.get("/monthly-summary");
  for (const ms of monthlySummaries.data) {
    await api.delete(`/monthly-summary/${ms.id}`);
  }

  // 4. Delete all biweekly summaries
  const biweeklySummaries = await api.get("/biweekly-summary");
  for (const bs of biweeklySummaries.data) {
    await api.delete(`/biweekly-summary/${bs.id}`);
  }

  // 5. Delete all vehicles
  const vehicles = await api.get("/vehicles");
  for (const v of vehicles.data) {
    await api.delete(`/vehicles/${v.id}`);
  }
}; 