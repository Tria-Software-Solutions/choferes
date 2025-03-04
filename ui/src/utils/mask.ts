export const maskLicensePlate = (plate: string): string => {
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
