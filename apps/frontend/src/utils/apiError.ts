// Extracts the user-facing message from an API (axios) error.
// The backend always answers failures with { message: string } in Spanish,
// which is far more useful than axios' generic English error text.
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { message?: string } } })?.response
    ?.data;
  if (data && typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
};
