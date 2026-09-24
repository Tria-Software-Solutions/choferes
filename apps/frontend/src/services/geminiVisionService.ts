// Gemini Vision processing through the backend proxy.
// The API key never ships to the browser — it lives server-side
// (backend env GEMINI_API_KEY) and is called via POST /api/vision/gemini.
import api from "./api";

export interface GeminiVehicleEntry {
  ticket: string;
  licensePlate: string;
  brand: string;
  color: string;
  parkingSpace: string;
  observation: string;
}

export interface GeminiResult {
  date?: string;
  entries: GeminiVehicleEntry[];
}

const toEntry = (entry: Record<string, unknown>): GeminiVehicleEntry => ({
  ticket: String(entry.ticket ?? ""),
  licensePlate: String(entry.licensePlate ?? ""),
  brand: String(entry.brand ?? ""),
  color: String(entry.color ?? ""),
  parkingSpace: String(entry.parkingSpace ?? ""),
  observation: String(entry.observation ?? ""),
});

export class GeminiVisionService {
  /**
   * Process an image file using the backend Gemini proxy
   */
  static async processImage(file: File): Promise<GeminiResult> {
    const base64Image = await this.fileToBase64(file);
    const data = (base64Image.split(",")[1] || base64Image).replace(/\s+/g, "");

    try {
      const response = await api.post<{ date?: string; entries?: unknown[] }>(
        "/vision/gemini",
        {
          mimeType: file.type || "image/jpeg",
          data,
        },
      );

      return {
        date: typeof response.data.date === "string" ? response.data.date : "",
        entries: Array.isArray(response.data.entries)
          ? response.data.entries.map((entry) => toEntry(entry as Record<string, unknown>))
          : [],
      };
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { error?: string } };
      };
      const message = axiosError.response?.data?.error;
      if (message) {
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * Convert file to base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}