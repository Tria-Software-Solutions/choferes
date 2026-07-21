/**
 * Shared regex patterns for field validation.
 * Used by both frontend forms and backend API validation.
 */

/** Name validation: letters (including accented), spaces, and hyphens */
export const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;

/** Email validation: standard email format */
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Username validation: starts with a letter, 3-20 chars, letters/numbers/underscore/dot */
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;

/**
 * Password validation:
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (non-alphanumeric)
 */
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

/** ATP parking lot format: ATP<1-9>-<3-4 digits> */
export const atpParkingLotRegex = /^(?:ATP[1-9]-\d{3,4}|nulo|n\/a)$/i;
