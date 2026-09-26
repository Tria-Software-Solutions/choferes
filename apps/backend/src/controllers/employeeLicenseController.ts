// Controller for HTTP requests related to employee driver's licenses.
import { Request, Response } from "express";
import * as licenseService from "../services/employeeLicenseService";
import { isServiceError } from "../utils/errors";

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return res.status(500).json({ message: fallbackMessage, error });
};

export const getLicenses = async (req: Request, res: Response) => {
  try {
    const result = await licenseService.getLicenses(req.query as Record<string, string>);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error fetching licenses");
  }
};

export const getLicenseById = async (req: Request, res: Response) => {
  try {
    const license = await licenseService.getLicenseById(parseInt(req.params.id, 10));
    if (license) return res.status(200).json(license);
    return res.status(404).json({ message: "Licencia no encontrada" });
  } catch (error) {
    return handleError(res, error, "Error fetching license");
  }
};

export const createLicense = async (req: Request, res: Response) => {
  try {
    const license = await licenseService.createLicense(req.body);
    return res.status(201).json(license);
  } catch (error) {
    return handleError(res, error, "Error creating license");
  }
};

export const updateLicense = async (req: Request, res: Response) => {
  try {
    const license = await licenseService.updateLicense(parseInt(req.params.id, 10), req.body);
    if (license) return res.status(200).json(license);
    return res.status(404).json({ message: "Licencia no encontrada" });
  } catch (error) {
    return handleError(res, error, "Error updating license");
  }
};

export const deleteLicense = async (req: Request, res: Response) => {
  try {
    const deleted = await licenseService.deleteLicense(parseInt(req.params.id, 10));
    if (deleted) return res.status(204).end();
    return res.status(404).json({ message: "Licencia no encontrada" });
  } catch (error) {
    return handleError(res, error, "Error deleting license");
  }
};
