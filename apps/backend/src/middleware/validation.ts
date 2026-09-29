import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import {
  LICENSE_TYPES,
  DISCIPLINARY_ACTION_TYPES,
  DISCIPLINARY_SEVERITIES,
  EMPLOYEE_POSITIONS,
  EMPLOYEE_TERMINATION_REASONS,
} from "@choferes/shared";

/**
 * Middleware that checks express-validator result and returns 400 with errors if validation failed.
 * Place this after the validation rule array in a route.
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Error de validación",
      errors: errors.array().map((e) => ({
        field: (e as { path?: string }).path || e.type,
        message: e.msg,
      })),
    });
  }
  return next();
};

// ─── ID param ────────────────────────────────────────────────────────────────

export const idParam = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido: debe ser un número entero positivo"),
];

// Teléfono CR opcional: solo dígitos, 8 de fijo o 9 con el 8 inicial de móvil.
const phoneRule = (field: string) =>
  body(field)
    .optional({ values: "null" })
    .trim()
    .customSanitizer((value: string) => value.replace(/\D/g, ""))
    .isLength({ min: 1, max: 9 })
    .withMessage(`${field} debe tener entre 1 y 9 dígitos`);

// Optional YYYY-MM-DD body field (shared by contract, licenses and dates).
const dateOnly = (field: string) =>
  body(field)
    .optional({ values: "null" })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(`${field} debe tener formato YYYY-MM-DD`);

// Contract / termination / file fields of an employee.
export const contractBodyRules = [
  dateOnly("contractStartDate"),
  dateOnly("terminationDate"),
  body("terminationReason")
    .optional({ values: "null" })
    .isIn([...EMPLOYEE_TERMINATION_REASONS])
    .withMessage("terminationReason inválido"),
  body("terminationNotes")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("terminationNotes no puede exceder 2000 caracteres"),
  // Solo existen los puestos de EMPLOYEE_POSITIONS (cada uno con su rol).
  body("position")
    .optional({ values: "null" })
    .trim()
    .isIn([...EMPLOYEE_POSITIONS])
    .withMessage(`position debe ser uno de: ${EMPLOYEE_POSITIONS.join(", ")}`),
  // La cédula y los teléfonos se guardan sin máscara: solo dígitos, para que
  // la base siga siendo ordenable y buscable. El formato se aplica en la UI.
  body("nationalId")
    .optional({ values: "null" })
    .trim()
    .customSanitizer((value: string) => value.replace(/\D/g, ""))
    .isLength({ min: 1, max: 9 })
    .withMessage("nationalId debe tener entre 1 y 9 dígitos"),
  phoneRule("primaryPhone"),
  phoneRule("secondaryPhone"),
];

// ─── Employees ───────────────────────────────────────────────────────────────

export const employeeRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ max: 100 })
    .withMessage("El apellido no puede exceder 100 caracteres"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Email inválido")
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),
  // Contract fields for create — same rules as update
  ...contractBodyRules,
  body("gender")
    .optional({ values: "falsy" })
    .isIn(["Masculino", "Femenino"])
    .withMessage("gender debe ser Masculino o Femenino"),
  body("hourlyRate")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("hourlyRate debe ser un número ≥ 0"),
  body("vacationDays")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("vacationDays debe ser un entero ≥ 0"),
];

export const employeeUpdateRules = [
  ...idParam,
  ...contractBodyRules,
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El apellido no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El apellido no puede exceder 100 caracteres"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Email inválido")
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),
  body("gender")
    .optional({ values: "falsy" })
    .isIn(["Masculino", "Femenino"])
    .withMessage("gender debe ser Masculino o Femenino"),
  body("hourlyRate")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("hourlyRate debe ser un número ≥ 0"),
  body("vacationDays")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("vacationDays debe ser un entero ≥ 0"),
];

// ─── Schedules ───────────────────────────────────────────────────────────────

export const scheduleRules = [
  body("label")
    .trim()
    .notEmpty()
    .withMessage("La etiqueta del horario es requerida")
    .isLength({ max: 100 })
    .withMessage("La etiqueta no puede exceder 100 caracteres"),
  body("hours")
    .isInt({ min: 1, max: 168 })
    .withMessage("Las horas deben ser un número entero entre 1 y 168"),
  body("days").isArray({ min: 1 }).withMessage("Debe incluir al menos un día"),
  body("days.*").isString().trim().notEmpty().withMessage("Cada día debe ser un texto válido"),
  body("scheduleDays").optional().isArray().withMessage("scheduleDays debe ser un array"),
  body("scheduleDays.*.day")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Cada scheduleDay debe tener un día válido"),
  body("scheduleDays.*.hours")
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage("Cada scheduleDay debe tener horas válidas (1-168)"),
];

export const scheduleUpdateRules = [
  ...idParam,
  body("label")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La etiqueta del horario no puede estar vacía")
    .isLength({ max: 100 })
    .withMessage("La etiqueta no puede exceder 100 caracteres"),
  body("hours")
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage("Las horas deben ser un número entero entre 1 y 168"),
  body("days").optional().isArray({ min: 1 }).withMessage("Debe incluir al menos un día"),
  body("days.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Cada día debe ser un texto válido"),
];

// ─── Vehicles ────────────────────────────────────────────────────────────────

export const vehicleRules = [
  body("ticket")
    .trim()
    .notEmpty()
    .withMessage("El ticket es requerido")
    .isLength({ max: 50 })
    .withMessage("El ticket no puede exceder 50 caracteres"),
  body("licensePlate")
    .trim()
    .notEmpty()
    .withMessage("La placa es requerida")
    .isLength({ max: 20 })
    .withMessage("La placa no puede exceder 20 caracteres"),
  body("brand")
    .trim()
    .notEmpty()
    .withMessage("La marca es requerida")
    .isLength({ max: 50 })
    .withMessage("La marca no puede exceder 50 caracteres"),
  body("color")
    .trim()
    .notEmpty()
    .withMessage("El color es requerido")
    .isLength({ max: 30 })
    .withMessage("El color no puede exceder 30 caracteres"),
  body("parkingLot")
    .trim()
    .notEmpty()
    .withMessage("El parqueo es requerido")
    .isLength({ max: 100 })
    .withMessage("El parqueo no puede exceder 100 caracteres"),
  body("parkingDate")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("La fecha de parqueo debe tener formato ISO8601 válido"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las notas no pueden exceder 500 caracteres"),
];

export const vehicleUpdateRules = [
  ...idParam,
  body("ticket")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El ticket no puede estar vacío")
    .isLength({ max: 50 })
    .withMessage("El ticket no puede exceder 50 caracteres"),
  body("licensePlate")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La placa no puede estar vacía")
    .isLength({ max: 20 })
    .withMessage("La placa no puede exceder 20 caracteres"),
  body("brand")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La marca no puede estar vacía")
    .isLength({ max: 50 })
    .withMessage("La marca no puede exceder 50 caracteres"),
  body("color")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El color no puede estar vacío")
    .isLength({ max: 30 })
    .withMessage("El color no puede exceder 30 caracteres"),
  body("parkingLot")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El parqueo no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El parqueo no puede exceder 100 caracteres"),
  body("parkingDate")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("La fecha de parqueo debe tener formato ISO8601 válido"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las notas no pueden exceder 500 caracteres"),
];

export const vehicleDateQuery = [
  query("date")
    .notEmpty()
    .withMessage("El parámetro 'date' es requerido")
    .isISO8601()
    .withMessage("La fecha debe tener formato ISO8601 válido (ej: 2024-01-15)"),
];

// ─── Users ───────────────────────────────────────────────────────────────────

export const userRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ max: 100 })
    .withMessage("El apellido no puede exceder 100 caracteres"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre de usuario debe tener entre 3 y 50 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("El nombre de usuario solo puede contener letras, números y guiones bajos"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Email inválido")
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  // Rol a asignar (opcional). Si se omite, el servicio asigna el rol "Usuario".
  body("roleId").optional().isInt({ min: 1 }).withMessage("roleId inválido"),
];

export const userUpdateRules = [
  ...idParam,
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El apellido no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El apellido no puede exceder 100 caracteres"),
  body("username")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre de usuario debe tener entre 3 y 50 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("El nombre de usuario solo puede contener letras, números y guiones bajos"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email inválido")
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),
];

export const userStatusUpdateRules = [
  ...idParam,
  body("isActive").isBoolean().withMessage("isActive debe ser un booleano (true/false)"),
];

export const userPasswordUpdateRules = [
  ...idParam,
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("currentPassword")
    .optional()
    .isString()
    .withMessage("La contraseña actual debe ser un texto"),
];

export const userTemporalPasswordUpdateRules = [
  ...idParam,
  body("temporalPassword")
    .notEmpty()
    .withMessage("La contraseña temporal es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña temporal debe tener al menos 6 caracteres"),
];

// ─── Roles ───────────────────────────────────────────────────────────────────

export const roleRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre del rol es requerido")
    .isLength({ max: 50 })
    .withMessage("El nombre no puede exceder 50 caracteres"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("La descripción no puede exceder 255 caracteres"),
];

export const roleUpdateRules = [
  ...idParam,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre del rol no puede estar vacío")
    .isLength({ max: 50 })
    .withMessage("El nombre no puede exceder 50 caracteres"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("La descripción no puede exceder 255 caracteres"),
];

export const roleNameParam = [
  param("name").trim().notEmpty().withMessage("El nombre del rol es requerido"),
];

// ─── Permissions ─────────────────────────────────────────────────────────────

export const permissionRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre del permiso es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),
];

export const permissionNamesParam = [
  param("names").trim().notEmpty().withMessage("Los nombres de permisos son requeridos"),
];

// ─── Hours Worked ────────────────────────────────────────────────────────────

export const hoursWorkedRules = [
  body("employeeId")
    .isInt({ min: 1 })
    .withMessage("El ID del empleado debe ser un número entero positivo"),
  body("date")
    .notEmpty()
    .withMessage("La fecha es requerida")
    .isISO8601()
    .withMessage("La fecha debe tener formato ISO8601 válido"),
  body("scheduleId")
    .isInt({ min: 1 })
    .withMessage("El ID del horario debe ser un número entero positivo"),
];

export const hoursWorkedUpdateRules = [
  ...idParam,
  body("employeeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del empleado debe ser un número entero positivo"),
  body("date").optional().isISO8601().withMessage("La fecha debe tener formato ISO8601 válido"),
  body("scheduleId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del horario debe ser un número entero positivo"),
]; // ─── Notifications ───────────────────────────────────────────────────────────

export const notificationRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("El título es requerido")
    .isLength({ max: 150 })
    .withMessage("El título no puede exceder 150 caracteres"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("El mensaje es requerido")
    .isLength({ max: 500 })
    .withMessage("El mensaje no puede exceder 500 caracteres"),
  body("type")
    .optional()
    .isIn(["info", "success", "warning", "error"])
    .withMessage("type debe ser uno de: info, success, warning, error"),
  body("category")
    .optional()
    .isIn(["employee", "schedule", "vehicle", "system", "report"])
    .withMessage("category inválida"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("priority debe ser uno de: low, medium, high"),
  body("actionUrl")
    .optional({ values: "falsy" })
    .isLength({ max: 255 })
    .withMessage("actionUrl no puede exceder 255 caracteres")
    // In-app routes only: the client navigates to it on click.
    .matches(/^\/(?!\/)[\w\-./?=&%#]*$/)
    .withMessage("actionUrl debe ser una ruta interna (ej. /employees)"),
  body("actionText")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("actionText no puede exceder 100 caracteres"),
];

export const paymentReminderRules = [
  body("today")
    .optional({ values: "falsy" })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("today debe tener formato YYYY-MM-DD"),
];

// ─── Pagination & search query params ───────────────────────────────────────
export const paginationRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("page debe ser un número entero positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("limit debe ser un número entero entre 1 y 10000"),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search no puede exceder 100 caracteres"),
];

// GET /employees: pagination/search plus an optional active/inactive filter.
export const employeeQueryRules = [
  ...paginationRules,
  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isActive debe ser true o false"),
];

// ─── HoursWorked ──────────────────────────────────────────────────────────────

// GET /hours-worked: pagination plus an optional inclusive date range so the
// board can fetch only the visible week instead of the whole history.
export const hoursWorkedQueryRules = [
  ...paginationRules,
  query("employeeId").optional().isInt({ min: 1 }).withMessage("employeeId inválido"),
  query("dateFrom").optional().isISO8601().withMessage("dateFrom debe ser una fecha ISO válida"),
  query("dateTo").optional().isISO8601().withMessage("dateTo debe ser una fecha ISO válida"),
  query("dateFrom").custom((value, { req }) => {
    const dateTo = req.query?.dateTo as string | undefined;
    if (value && dateTo && new Date(value) > new Date(dateTo)) {
      throw new Error("dateFrom no puede ser posterior a dateTo");
    }
    return true;
  }),
];

// POST /hours-worked/recalculate: employeeId (optional) and date (optional).
export const recalculateRules = [
  body("employeeId")
    .optional({ values: "null" })
    .isInt({ min: 1 })
    .withMessage("employeeId debe ser un número entero positivo"),
  body("date")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("date debe ser una fecha ISO válida"),
];

// ─── Payments ────────────────────────────────────────────────────────────────

const amountField = (field: string) =>
  body(field)
    .optional({ values: "null" })
    .isFloat({ min: 0, max: 999999999 })
    .withMessage(`${field} debe ser un monto numérico no negativo`);

export const paymentRules = [
  body("employeeId").isInt({ min: 1 }).withMessage("employeeId inválido"),
  body("biweekNumber")
    .isInt({ min: 1, max: 24 })
    .withMessage("biweekNumber debe estar entre 1 y 24"),
  body("year").isInt({ min: 2000, max: 2100 }).withMessage("year debe estar entre 2000 y 2100"),
  body("payDate")
    .optional({ values: "null" })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("payDate debe tener formato YYYY-MM-DD"),
  body("notes")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("notes no puede exceder 2000 caracteres"),
  amountField("regularSalary"),
  amountField("overtimePay"),
  amountField("mileage"),
  amountField("others"),
  amountField("socialCharges"),
  amountField("deductions"),
];

export const paymentUpdateRules = [
  ...idParam,
  body("payDate")
    .optional({ values: "null" })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("payDate debe tener formato YYYY-MM-DD"),
  body("notes")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("notes no puede exceder 2000 caracteres"),
  body("status")
    .optional()
    .isIn(["pending", "cancelled"])
    .withMessage("status debe ser pending o cancelled"),
  amountField("regularSalary"),
  amountField("overtimePay"),
  amountField("mileage"),
  amountField("others"),
  amountField("socialCharges"),
  amountField("deductions"),
  body("automaticFields")
    .optional()
    .isArray({ max: 6 })
    .withMessage("automaticFields debe ser una lista"),
  body("automaticFields.*")
    .isIn(["regularSalary", "overtimePay", "mileage", "others", "socialCharges", "deductions"])
    .withMessage("automaticFields contiene un campo inválido"),
];

// POST /payments/generate — fill a quincena's slips for every employee.
export const paymentGenerateRules = [
  body("biweekNumber")
    .isInt({ min: 1, max: 24 })
    .withMessage("biweekNumber debe estar entre 1 y 24"),
  body("year").isInt({ min: 2000, max: 2100 }).withMessage("year debe estar entre 2000 y 2100"),
];

export const paymentQueryRules = [
  ...paginationRules,
  query("employeeId").optional().isInt({ min: 1 }).withMessage("employeeId inválido"),
  query("year").optional().isInt({ min: 2000, max: 2100 }).withMessage("year inválido"),
  query("biweekNumber").optional().isInt({ min: 1, max: 24 }).withMessage("biweekNumber inválido"),
  query("status").optional().isIn(["pending", "sent", "cancelled"]).withMessage("status inválido"),
];

// GET /payments/recalculate/:employeeId/:biweekNumber/:year — breakdown preview.
export const biweekParams = [
  param("employeeId").isInt({ min: 1 }).withMessage("employeeId inválido"),
  param("biweekNumber").isInt({ min: 1, max: 24 }).withMessage("biweekNumber inválido"),
  param("year").isInt({ min: 2000, max: 2100 }).withMessage("year inválido"),
];

// POST /payments/:id/email — optional PDF attachment generated client-side.
export const paymentEmailRules = [
  ...idParam,
  body("pdfBase64")
    .optional({ values: "null" })
    .isString()
    .isLength({ max: 7000000 })
    .withMessage("pdfBase64 demasiado grande (máx. ~5MB)"),
  body("pdfFileName")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("pdfFileName no puede exceder 255 caracteres"),
];

// ─── Vacations ───────────────────────────────────────────────────────────────

export const vacationRules = [
  body("employeeId").isInt({ min: 1 }).withMessage("employeeId inválido"),
  body("startDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("startDate debe tener formato YYYY-MM-DD"),
  body("endDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("endDate debe tener formato YYYY-MM-DD"),
  body("reason")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("reason no puede exceder 1000 caracteres"),
];

// POST /me/vacations — self-service request. The employee is resolved from the
// session (users.employeeId), so `employeeId` is intentionally not accepted.
export const myVacationRules = [
  body("startDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("startDate debe tener formato YYYY-MM-DD"),
  body("endDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("endDate debe tener formato YYYY-MM-DD"),
  body("reason")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("reason no puede exceder 1000 caracteres"),
];

export const vacationUpdateRules = [
  ...idParam,
  body("startDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("startDate debe tener formato YYYY-MM-DD"),
  body("endDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("endDate debe tener formato YYYY-MM-DD"),
  body("reason")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("reason no puede exceder 1000 caracteres"),
  body("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("status debe ser pending, approved o rejected"),
];

export const vacationQueryRules = [
  ...paginationRules,
  query("employeeId").optional().isInt({ min: 1 }).withMessage("employeeId inválido"),
  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("status inválido"),
];

export const biweeklySummaryQueryRules = [
  ...paginationRules,
  query("employeeId").optional().isInt({ min: 1 }).withMessage("employeeId inválido"),
];

// ─── Employee licenses ──────────────────────────────────────────────────────

export const licenseRules = [
  body("employeeId").isInt({ min: 1 }).withMessage("employeeId inválido"),
  body("licenseType")
    .isIn([...LICENSE_TYPES])
    .withMessage("Categoría de licencia inválida"),
  body("licenseNumber")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 50 })
    .withMessage("licenseNumber no puede exceder 50 caracteres"),
  dateOnly("issuedAt"),
  dateOnly("expiresAt"),
  body("notes")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("notes no puede exceder 1000 caracteres"),
];

export const licenseUpdateRules = [
  ...idParam,
  body("licenseType")
    .optional()
    .isIn([...LICENSE_TYPES])
    .withMessage("Categoría de licencia inválida"),
  body("licenseNumber")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 50 })
    .withMessage("licenseNumber no puede exceder 50 caracteres"),
  dateOnly("issuedAt"),
  dateOnly("expiresAt"),
  body("notes")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("notes no puede exceder 1000 caracteres"),
];

export const licenseQueryRules = [
  ...paginationRules,
  query("employeeId").optional().isInt({ min: 1 }).withMessage("employeeId inválido"),
];

// ─── Disciplinary actions (amonestaciones) ──────────────────────────────────

// Attachments travel as base64 data URLs in the JSON body. Each file is capped
// at ~2.2MB (3,000,000 chars) and at most 3 files, keeping the request under
// the global 10MB body limit.
const attachmentRules = [
  body("attachments")
    .optional({ values: "null" })
    .isArray({ max: 3 })
    .withMessage("Máximo 3 archivos adjuntos"),
  body("attachments.*.name")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Cada adjunto debe tener nombre"),
  body("attachments.*.mimeType")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Cada adjunto debe tener tipo"),
  body("attachments.*.size").optional().isInt({ min: 0 }).withMessage("Tamaño de adjunto inválido"),
  body("attachments.*.dataUrl")
    .optional()
    .isString()
    .isLength({ max: 3000000 })
    .withMessage("Cada adjunto no puede exceder ~2MB")
    // Must be an inline base64 file. Anything else (e.g. a `javascript:` URL)
    // would run in the viewer's session when the attachment is opened.
    .matches(/^data:[\w.+-]+\/[\w.+-]+;base64,[A-Za-z0-9+/=\s]*$/)
    .withMessage("Cada adjunto debe ser un archivo codificado en base64"),
];

export const disciplinaryRules = [
  body("employeeId").isInt({ min: 1 }).withMessage("employeeId inválido"),
  body("actionDate")
    .notEmpty()
    .withMessage("actionDate es requerido")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("actionDate debe tener formato YYYY-MM-DD"),
  body("type")
    .isIn([...DISCIPLINARY_ACTION_TYPES])
    .withMessage("Tipo de amonestación inválido"),
  body("severity")
    .optional()
    .isIn([...DISCIPLINARY_SEVERITIES])
    .withMessage("severity inválida"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("El motivo es requerido")
    .isLength({ max: 500 })
    .withMessage("El motivo no puede exceder 500 caracteres"),
  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 4000 })
    .withMessage("description no puede exceder 4000 caracteres"),
  ...attachmentRules,
];

export const disciplinaryUpdateRules = [
  ...idParam,
  dateOnly("actionDate"),
  body("type")
    .optional()
    .isIn([...DISCIPLINARY_ACTION_TYPES])
    .withMessage("Tipo de amonestación inválido"),
  body("severity")
    .optional()
    .isIn([...DISCIPLINARY_SEVERITIES])
    .withMessage("severity inválida"),
  body("reason")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El motivo no puede estar vacío")
    .isLength({ max: 500 })
    .withMessage("El motivo no puede exceder 500 caracteres"),
  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 4000 })
    .withMessage("description no puede exceder 4000 caracteres"),
  ...attachmentRules,
];

export const disciplinaryQueryRules = [
  ...paginationRules,
  query("employeeId").optional().isInt({ min: 1 }).withMessage("employeeId inválido"),
];

// ─── Tasks (personal to-do lists) ─────────────────────────────────────────────

const TASK_RECURRENCE_VALUES = ["none", "daily", "weekdays", "weekly", "monthly", "yearly"];
const TASK_LIST_COLOR_VALUES = ["indigo", "sky", "emerald", "amber", "rose", "violet", "slate"];

const taskFields = (optionalTitle: boolean) => [
  (optionalTitle ? body("title").optional() : body("title"))
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("El título es obligatorio (máx. 500 caracteres)"),
  body("notes")
    .optional({ values: "null" })
    .isString()
    .isLength({ max: 10000 })
    .withMessage("Las notas no pueden exceder 10000 caracteres"),
  body("listId").optional({ values: "null" }).isInt({ min: 1 }).withMessage("listId inválido"),
  body("dueDate")
    .optional({ values: "null" })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("dueDate debe tener formato YYYY-MM-DD"),
  body("dueTime")
    .optional({ values: "null" })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("dueTime debe tener formato HH:mm"),
  body("remindAt")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("remindAt debe ser una fecha ISO 8601"),
  body("priority").optional().isInt({ min: 0, max: 3 }).withMessage("priority debe ser 0-3"),
  body("isImportant").optional().isBoolean().withMessage("isImportant debe ser booleano"),
  body("recurrence").optional().isIn(TASK_RECURRENCE_VALUES).withMessage("recurrence inválida"),
  body("subtasks")
    .optional()
    .isArray({ max: 50 })
    .withMessage("subtasks debe ser una lista (máx. 50)"),
  body("subtasks.*.id").optional().isString().isLength({ min: 1, max: 50 }),
  body("subtasks.*.title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("Cada paso necesita un título (máx. 300 caracteres)"),
  body("subtasks.*.done").optional().isBoolean(),
  body("completed").optional().isBoolean().withMessage("completed debe ser booleano"),
];

export const taskCreateRules = taskFields(false);

export const taskUpdateRules = [...idParam, ...taskFields(true)];

export const reorderRules = [
  body("ids").isArray({ min: 1, max: 1000 }).withMessage("ids debe ser una lista"),
  body("ids.*").isInt({ min: 1 }).withMessage("ids contiene un valor inválido"),
];

export const clearCompletedRules = [
  query("listId")
    .optional()
    .matches(/^(\d+|inbox)$/)
    .withMessage("listId inválido"),
];

export const taskListRules = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("El nombre es obligatorio (máx. 80 caracteres)"),
  body("color").optional().isIn(TASK_LIST_COLOR_VALUES).withMessage("color inválido"),
];

export const taskListUpdateRules = [
  ...idParam,
  body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("El nombre es obligatorio (máx. 80 caracteres)"),
  body("color").optional().isIn(TASK_LIST_COLOR_VALUES).withMessage("color inválido"),
];
