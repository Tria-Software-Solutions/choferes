// Controller for Gemini Vision (vehicle logbook image → structured data)
import { Request, Response } from "express";
import * as visionService from "../services/visionService";

const processImage = async (req: Request, res: Response) => {
  try {
    const { mimeType, data } = req.body as { mimeType?: string; data?: string };

    if (typeof mimeType !== "string" || !mimeType.startsWith("image/")) {
      return res.status(400).json({ error: "mimeType debe ser un tipo de imagen (image/*)." });
    }

    if (typeof data !== "string" || data.length === 0) {
      return res.status(400).json({ error: "La data base64 de la imagen es requerida." });
    }

    // ~10MB cap, consistent with the body-parser limit
    if (data.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "La imagen es demasiado grande." });
    }

    const result = await visionService.processImage(mimeType, data);
    return res.status(200).json(result);
  } catch (error) {
    // Gemini errors are already user-facing Spanish messages from visionService
    const message = error instanceof Error ? error.message : "Error procesando la imagen";
    return res.status(502).json({ error: message });
  }
};

export default {
  processImage,
};
