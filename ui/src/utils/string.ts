import { Schedule } from "../models/Schedule";
import { ColumnsTranslation } from "./columnsTranslation";
import { EnglishDayOfWeek } from "./dayAbreviations";
import { EnglishAbrevMonthOfYear } from "./monthAbreviations";

export const translateColumnHeaderToSpanish = (
  column: string | number | symbol
): string => {
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
    ticket: "Boleta",
    licensePlate: "Placa",
    brand: "Marca",
    color: "Color",
    parkingLot: "Espacio",
    notes: "Observaciones",
    createdAt: "Agregado",
    updatedAt: "Actualizado",
    roleName: "Rol",
    permissionNames: "Permisos",
  };

  if (typeof column === "string" && column in translations) {
    return translations[column as keyof ColumnsTranslation];
  }

  return String(column);
};

export const getOptionsForDay = (
  day: string,
  schedules: Schedule[]
): Schedule[] => {
  return schedules.filter((schedule) =>
    schedule.days.includes(day.toLowerCase())
  );
};

export const translateDayToAbrevSpanish = (
  dayInEnglish: EnglishDayOfWeek
): string => {
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
  monthInEnglish: EnglishAbrevMonthOfYear
): string => {
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
  period: "weekly" | "biweekly" | "monthly"
): string => {
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

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
