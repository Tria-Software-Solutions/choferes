import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

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
];

export const employeeUpdateRules = [
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
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Email inválido")
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),
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
  body("specialSchedule")
    .optional()
    .isBoolean()
    .withMessage("specialSchedule debe ser un booleano"),
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
  body("specialSchedule")
    .optional()
    .isBoolean()
    .withMessage("specialSchedule debe ser un booleano"),
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
]; // ─── Pagination & search query params ───────────────────────────────────────
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
