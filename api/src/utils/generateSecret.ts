import crypto from "crypto";

export const generateSecret = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

const secret = generateSecret();
console.log("Generated JWT Secret:", secret);