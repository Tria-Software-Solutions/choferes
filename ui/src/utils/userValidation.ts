// Utilidad de validación de campos de usuario

export const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function validateName(value: string): string {
  if (!value.trim()) return "Este campo es requerido";
  if (!nameRegex.test(value))
    return "Solo se permiten letras, espacios y guiones";
  if (value.trim().length < 2) return "Mínimo 2 caracteres";
  if (value.trim().length > 50) return "Máximo 50 caracteres";
  return "";
}

export function validateEmail(value: string): string {
  if (!value.trim()) return "Este campo es requerido";
  if (!emailRegex.test(value)) return "Formato de email inválido";
  return "";
}

export function validateUsername(value: string): string {
  if (!value.trim()) return "Este campo es requerido";
  if (!usernameRegex.test(value))
    return "Debe empezar con letra y contener solo letras, números, puntos y guiones bajos";
  return "";
}

export function validatePassword(value: string): string {
  if (!value.trim()) return "Este campo es requerido";
  if (!passwordRegex.test(value))
    return "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial";
  return "";
}

export function validatePasswordMatch(pass1: string, pass2: string): string {
  if (!pass1 || !pass2) return "Los campos son requeridos";
  if (pass1 !== pass2) return "Las contraseñas no coinciden";
  return "";
}
