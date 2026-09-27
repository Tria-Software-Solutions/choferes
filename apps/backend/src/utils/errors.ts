import type { Response } from "express";

// Domain error with an HTTP status code, so controllers can translate service
// failures (duplicates, insufficient balance, missing config) into proper 4xx
// responses instead of a generic 500.
export class ServiceError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
  }
}

export const isServiceError = (error: unknown): error is ServiceError =>
  error instanceof ServiceError;

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Sequelize unique-constraint violations (duplicate username/email, ...) are
// client errors, not server failures.
const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Error && error.name === "SequelizeUniqueConstraintError";

// Sends an error response without leaking internals. Raw error objects (a
// Sequelize error carries the SQL statement and schema details) are logged
// server-side and never serialized to the client; outside production the
// error message is included as `detail` to ease debugging.
export const sendError = (
  res: Response,
  status: number,
  message: string,
  error?: unknown,
): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (isUniqueConstraintError(error)) {
    return res.status(409).json({ message: "Ya existe un registro con esos datos" });
  }
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[${message}]`, error instanceof Error ? error.message : error);
  }
  const body: { message: string; detail?: string } = { message };
  if (!IS_PRODUCTION && error instanceof Error) {
    body.detail = error.message;
  }
  return res.status(status).json(body);
};

export const sendServerError = (res: Response, message: string, error?: unknown): Response =>
  sendError(res, 500, message, error);
