// Utility functions and regex for validating user fields (name, email, username, password)
// Provides validation logic for forms and user input

import FORMS from "../constants/forms.constants";

export const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function validateName(value: string): string {
  // Validates a user's name for required, format, and length
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!nameRegex.test(value)) return FORMS.NAME_LETTERS_ONLY;
  if (value.trim().length < 2) return FORMS.MIN_2_CHARS;
  if (value.trim().length > 50) return FORMS.MAX_50_CHARS;
  return "";
}

export function validateEmail(value: string): string {
  // Validates a user's email for required and format
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!emailRegex.test(value)) return FORMS.EMAIL_FORMAT;
  return "";
}

export function validateUsername(value: string): string {
  // Validates a username for required and format
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!usernameRegex.test(value)) return FORMS.USERNAME_START_LETTER;
  return "";
}

export function validatePassword(value: string): string {
  // Validates a password for required and complexity
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!passwordRegex.test(value)) return FORMS.PASSWORD_COMPLEXITY;
  return "";
}

export function validatePasswordMatch(pass1: string, pass2: string): string {
  // Validates that two passwords match and are both provided
  if (!pass1 || !pass2) return FORMS.PASSWORDS_REQUIRED;
  if (pass1 !== pass2) return FORMS.PASSWORDS_DONT_MATCH;
  return "";
}

export function validateParkingLotWithPrefix(
  prefix: string,
  value: string,
  invalidFormatMsg: string,
): string | null {
  const trimmedValue = value.trim();
  
  // If value starts with ATP, use strict validation
  if (trimmedValue.toUpperCase().startsWith("ATP")) {
    const atpRegex = /^(?:ATP[1-9]-\d{3,4}|nulo|n\/a)$/i;
    if (!atpRegex.test(trimmedValue)) {
      return invalidFormatMsg.replace("ATP", "ATP");
    }
    return null;
  }
  
  // For any other prefix or format, consider it valid
  return null;
}
