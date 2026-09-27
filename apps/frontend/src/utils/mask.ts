// Utility functions for masking and formatting license plate and parking lot strings
// Used for input formatting and validation in forms

/**
 * Cédula de identidad costarricense: 9 dígitos con guiones `1-0234-0567`.
 * Only digits reach the database; the mask is a view concern, so the stored
 * value stays sortable and searchable. Values typed with dashes (from older
 * records or pasted text) are normalized by stripping them first.
 */
export const maskNationalId = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits[0]}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
};

/**
 * Costa Rican landline: 8 digits formatted `2234-5678`. Mobile numbers (9
 * digits with a leading 8) keep the first group so both fit the same field:
 * `8312-3456`.
 */
export const maskPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, digits.length === 9 ? 4 : 4)}-${digits.slice(4)}`;
};

/** Strips the mask so the API only ever receives digits. */
export const digitsOnly = (value: string): string => value.replace(/\D/g, "");

export const maskLicensePlate = (plate: string): string => {
  // Formats a license plate string to uppercase, removes non-alphanumeric, and adds hyphen if needed
  const sanitizedPlate = plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const limitedPlate = sanitizedPlate.slice(0, 6);
  if (/^\d+$/.test(limitedPlate)) {
    return limitedPlate;
  }
  if (limitedPlate.length <= 3) {
    return limitedPlate;
  }
  if (limitedPlate.length <= 6) {
    const partBeforeHyphen = limitedPlate.substring(0, 3);
    const partAfterHyphen = limitedPlate.substring(3).replace(/[^0-9]/g, "");
    return `${partBeforeHyphen}-${partAfterHyphen}`;
  }
  return limitedPlate;
};

export const maskParkingLot = (parkingLot: string): string => {
  // Formats a parking lot string to uppercase, ensures 'ATP' prefix, and adds hyphen if needed
  const sanitizedParkingLot = parkingLot.replace(/[^0-9]/g, "").toUpperCase();
  let result = sanitizedParkingLot.startsWith("ATP")
    ? sanitizedParkingLot
    : "ATP" + sanitizedParkingLot;

  if (result.length < 4) {
    return result;
  }
  if (result.length > 8) {
    result = result.substring(0, 8);
  }
  if (result.length >= 5) {
    result = result.substring(0, 4) + "-" + result.substring(4);
  }
  return result;
};

export function maskParkingLotWithPrefix(
  prefix: string,
  rawValue: string,
): string {
  // Remove prefix if user types it
  let value = rawValue.replace(new RegExp(`^${prefix}`, "i"), "");
  // Remove non-numeric and dash except for the first part
  value = value.replace(/[^1-9\-\d]/g, "");
  // Format: PREFIX1-1234
  let match = value.match(/([1-9])-(\d{0,4})/);
  if (match) {
    return `${prefix}${match[1]}-${match[2]}`;
  } else {
    // Try to build as user types
    let numMatch = value.match(/([1-9])/);
    if (numMatch) {
      return `${prefix}${numMatch[1]}-`;
    } else {
      return `${prefix}`;
    }
  }
}
