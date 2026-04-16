import { Schedule } from "../models/Schedule";
import { ColumnsTranslation } from "./columnsTranslation";
import { EnglishDayOfWeek } from "./dayAbreviations";
import { EnglishAbrevMonthOfYear } from "./monthAbreviations";

// Utility functions for string translation, formatting, and mapping for UI labels and dates
// Includes helpers for translating columns, days, months, and periods to Spanish, and for string capitalization
export const translateColumnHeaderToSpanish = (
  column: string | number | symbol,
): string => {
  // Translates a column header key to its Spanish label
  const translations: ColumnsTranslation = {
    id: "Id",
    name: "Nombre",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    username: "Usuario",
    password: "Contraseña",
    label: "Asignación",
    days: "Días",
    hours: "Horas",
    specialSchedule: "Horario Especial",
    ticket: "Boleta",
    licensePlate: "Placa",
    brand: "Marca",
    color: "Color",
    parkingLot: "Espacio",
    parkingDate: "Fecha de Parqueo",
    notes: "Observaciones",
    updatedAt: "Actualizado",
    roleName: "Rol",
    permissionNames: "Permisos",
    driver: "Chofer",
    route: "Ruta",
    distance: "Distancia",
    trackingNumber: "N. de Guía",
    status: "Estado",
    createdAt: "",
  };

  if (typeof column === "string" && column in translations) {
    return translations[column as keyof ColumnsTranslation];
  }

  return String(column);
};

export const getOptionsForDay = (
  day: string,
  schedules: Schedule[],
): Schedule[] => {
  // Returns all schedules that include the given day, sorted by type and alphabetically
  return schedules
    .filter((schedule) =>
      schedule.days.includes(day.toLowerCase()),
    )
    .sort((a, b) => {
      // First sort by type: regular schedules (locations) first, then special schedules
      if (a.specialSchedule !== b.specialSchedule) {
        return a.specialSchedule ? 1 : -1;
      }
      // Then sort alphabetically by label
      return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
    });
};

export const translateDayToAbrevSpanish = (
  dayInEnglish: EnglishDayOfWeek,
): string => {
  // Translates an English day of week to its Spanish abbreviation
  const translationMap: Record<EnglishDayOfWeek, string> = {
    Sunday: "Dom",
    Monday: "Lun",
    Tuesday: "Mar",
    Wednesday: "Mié",
    Thursday: "Jue",
    Friday: "Vie",
    Saturday: "Sáb",
  };

  return translationMap[dayInEnglish];
};

export const translateDayOptionsToSpanish = (value: string): string => {
  // Translates a lowercase English day to its full Spanish name
  const dayMap: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };
  return dayMap[value] || value;
};

export const translateMonthToAbrevSpanish = (
  monthInEnglish: EnglishAbrevMonthOfYear,
): string => {
  // Translates an abbreviated English month to its Spanish abbreviation
  const translationMap: Record<EnglishAbrevMonthOfYear, string> = {
    Jan: "Ene",
    Feb: "Feb",
    Mar: "Mar",
    Apr: "Abr",
    May: "May",
    Jun: "Jun",
    Jul: "Jul",
    Aug: "Ago",
    Sep: "Set",
    Oct: "Oct",
    Nov: "Nov",
    Dec: "Dic",
  };

  return translationMap[monthInEnglish];
};

export const getMonthName = (month: number) => {
  // Returns the full Spanish name for a month number (1-12)
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  if (month < 1 || month > 12) {
    throw new Error("Número de mes inválido. Debe estar entre 1 y 12.");
  }

  return months[month - 1];
};

export const translatePeriodToSpanish = (
  period: "weekly" | "biweekly" | "monthly",
): string => {
  // Translates a period key to its Spanish label
  switch (period) {
    case "weekly":
      return "Semanal";
    case "biweekly":
      return "Quincenal";
    case "monthly":
      return "Mensual";
    default:
      return "";
  }
};

export const translatePriorityToSpanish = (
  priority: "low" | "medium" | "high",
): string => {
  // Translates a priority key to its Spanish label
  switch (priority) {
    case "low":
      return "Baja";
    case "medium":
      return "Media";
    case "high":
      return "Alta";
    default:
      return priority;
  }
};

export const capitalizeFirstLetter = (str: string) =>
  // Capitalizes the first letter of a string
  str.charAt(0).toUpperCase() + str.slice(1);
