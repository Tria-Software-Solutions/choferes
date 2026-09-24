// Server-side proxy for Google Gemini (keeps the API key out of the browser bundle).

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const DEFAULT_PROMPT = `
Analiza esta imagen de un libro de registro de vehículos y extrae la información en formato JSON estructurado.

Extrae los siguientes campos para cada vehículo:
- ticket: número de boleta/ticket
- licensePlate: placa del vehículo
- brand: marca del vehículo
- color: color del vehículo
- parkingSpace: espacio/parqueo asignado
- observation: observaciones (si las hay)

Devuelve ÚNICAMENTE un JSON con esta estructura:
{
  "date": "fecha extraída de la imagen si está visible",
  "entries": [
    {
      "ticket": "número",
      "licensePlate": "placa",
      "brand": "marca",
      "color": "color",
      "parkingSpace": "espacio",
      "observation": "observación"
    }
  ]
}

Si no hay datos o no puedes leer la imagen, devuelve un JSON vacío: {"entries": []}
`;

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

interface GeminiErrorResponse {
  status: number;
  message: string;
}

const parseGeminiError = (status: number, raw: string): GeminiErrorResponse => {
  let originalMessage = raw;
  try {
    const data = JSON.parse(raw) as { error?: { message?: string } };
    originalMessage = data.error?.message || raw;
  } catch {
    // keep raw text
  }

  const lower = originalMessage.toLowerCase();
  if (status === 429 || lower.includes("quota") || lower.includes("resource_exhausted")) {
    return {
      status: 429,
      message:
        "Has excedido la cuota de uso de Gemini API. Por favor espera unos minutos o habilita un plan de pago para continuar.",
    };
  }
  if (status === 404 || lower.includes("not found") || lower.includes("not_found")) {
    return {
      status: 502,
      message: "El modelo de Gemini no está disponible actualmente. Por favor intenta más tarde.",
    };
  }
  if (lower.includes("api key") || lower.includes("api_key")) {
    return {
      status: 502,
      message: "La API key de Gemini no es válida o no está configurada correctamente.",
    };
  }
  return {
    status,
    message: "Error al procesar la imagen con Gemini. Por favor intenta de nuevo más tarde.",
  };
};

// Extract structured data from an image. `imageData` is base64 without the
// data-URL prefix; `mimeType` is the image MIME type.
export const processImage = async (mimeType: string, imageData: string): Promise<GeminiResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en el servidor.");
  }

  const requestBody = {
    contents: [
      {
        parts: [
          { text: DEFAULT_PROMPT },
          { inline_data: { mime_type: mimeType, data: imageData } },
        ],
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  } catch {
    throw new Error("No se pudo conectar con el servicio de Gemini. Por favor intenta más tarde.");
  }

  if (!response.ok) {
    const raw = await response.text();
    const parsed = parseGeminiError(response.status, raw);
    throw new Error(parsed.message);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    return { date: "", entries: [] };
  }

  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No se pudo interpretar la respuesta de Gemini.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { date?: string; entries?: unknown[] };
  const entries = Array.isArray(parsed.entries)
    ? parsed.entries.map((entry) => {
        const e = entry as Record<string, unknown>;
        return {
          ticket: String(e.ticket ?? ""),
          licensePlate: String(e.licensePlate ?? ""),
          brand: String(e.brand ?? ""),
          color: String(e.color ?? ""),
          parkingSpace: String(e.parkingSpace ?? ""),
          observation: String(e.observation ?? ""),
        };
      })
    : [];

  return { date: typeof parsed.date === "string" ? parsed.date : "", entries };
};
