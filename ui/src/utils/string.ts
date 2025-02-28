import { Schedule } from "../models/Schedule";
import { ColumnsTranslation } from "./columnsTranslation";
import { EnglishDayOfWeek } from "./dayAbreviations";
import { EnglishAbrevMonthOfYear } from "./monthAbreviations";
import { DAYS } from "../constants/constants";

export const getOptionsForDay = (
  day: string,
  schedules: Schedule[]
): Schedule[] => {
  let dayFilter = "";

  switch (day.toLowerCase()) {
    case "friday":
      dayFilter = DAYS.FRIDAY;
      break;
    case "saturday":
      dayFilter = DAYS.SATURDAY;
      break;
    case "sunday":
      dayFilter = DAYS.SUNDAY;
      break;
    default:
      dayFilter = DAYS.WEEKDAY;
      break;
  }

  return schedules.filter((schedule) => schedule.day === dayFilter);
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
    label: "Lugar",
    day: "Día",
    hours: "Horas",
    createdAt: "Agregado",
    updatedAt: "Actualizado",
    ticket: "Boleta",
    licensePlate: "Placa",
    brand: "Marca",
    color: "Color",
    parkingLot: "Espacio",
    notes: "Observaciones"
  };

  if (typeof column === "string" && column in translations) {
    return translations[column as keyof ColumnsTranslation];
  }

  return String(column);
};

export const translateDayToAbrevSpanish = (dayInEnglish: EnglishDayOfWeek): string => {
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

export const translationsDayOptionsToSpanish: { [key: string]: string } = {
  weekday: "Lunes a Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const translateDayOptionsToSpanish = (day: string): string => {
  return translationsDayOptionsToSpanish[day] || day;
};

export const getDayOptionsSpanish = () => [
  { value: "weekday", label: "Lunes a Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export const mapDayValues = (value: string): string => {
  const dayMap: Record<string, string> = {
    weekday: "Lunes a Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };
  return dayMap[value] || value;
};

export const setDayOptionsEnglish = (day: string): string => {
  const lowerCaseDay = day.toLowerCase();

  if (["monday", "tuesday", "wednesday", "thursday"].includes(lowerCaseDay)) {
    return "weekday";
  }

  return lowerCaseDay;
};

export const translatePeriodToSpanish = (period: "weekly" | "biweekly" | "monthly"): string => {
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
