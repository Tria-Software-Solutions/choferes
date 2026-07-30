/**
 * Curated palette of distinctive, accessible colors for employee avatars.
 * Each color is chosen to be visually distinct from its neighbors and work
 * well on both light and dark backgrounds.
 */
const EMPLOYEE_COLORS = [
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#84cc16', // Lime
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#0ea5e9', // Sky
  '#eab308', // Yellow
  '#22c55e', // Green
  '#64748b', // Slate
  '#fb923c', // Orange (light)
  '#2dd4bf', // Teal (light)
];

/**
 * Returns a deterministic color for an employee based on their ID.
 * The same employee always gets the same color.
 */
export function getEmployeeColor(employeeId: number): string {
  return EMPLOYEE_COLORS[employeeId % EMPLOYEE_COLORS.length];
}

/**
 * Returns a low-opacity version of the employee color for use as a background.
 */
export function getEmployeeColorBg(employeeId: number, isDark: boolean): string {
  const color = getEmployeeColor(employeeId);
  return isDark ? `${color}20` : `${color}12`;
}
