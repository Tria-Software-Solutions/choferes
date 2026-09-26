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
