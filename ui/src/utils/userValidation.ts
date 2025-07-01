// Utilidad de validación de campos de usuario

import { FORMS } from '../constants/constants';

export const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function validateName(value: string): string {
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!nameRegex.test(value))
    return FORMS.NAME_LETTERS_ONLY;
  if (value.trim().length < 2) return FORMS.MIN_2_CHARS;
  if (value.trim().length > 50) return FORMS.MAX_50_CHARS;
  return "";
}

export function validateEmail(value: string): string {
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!emailRegex.test(value)) return FORMS.EMAIL_FORMAT;
  return "";
}

export function validateUsername(value: string): string {
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!usernameRegex.test(value))
    return FORMS.USERNAME_START_LETTER;
  return "";
}

export function validatePassword(value: string): string {
  if (!value.trim()) return FORMS.REQUIRED_FIELD;
  if (!passwordRegex.test(value))
    return FORMS.PASSWORD_COMPLEXITY;
  return "";
}

export function validatePasswordMatch(pass1: string, pass2: string): string {
  if (!pass1 || !pass2) return FORMS.PASSWORDS_REQUIRED;
  if (pass1 !== pass2) return FORMS.PASSWORDS_DONT_MATCH;
  return "";
}
