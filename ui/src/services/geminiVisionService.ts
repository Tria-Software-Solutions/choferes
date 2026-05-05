// Gemini Vision API Service for processing vehicle logbook images
// This service uses Google's Gemini Vision API to extract structured data from images

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

export class GeminiVisionService {
  private static readonly API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  /**
   * Process an image file using Gemini Vision API
   */
  static async processImage(file: File): Promise<GeminiResult> {
    if (!this.API_KEY) {
      throw new Error('No se ha configurado la API key de Gemini. Por favor configura la variable de entorno REACT_APP_GEMINI_API_KEY.');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(file);
      
      // Create the prompt for structured data extraction
      const prompt = `
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

      const requestBody = {
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: file.type,
                data: base64Image.split(',')[1] // Remove data:image/...;base64, prefix
              }
            }
          ]
        }]
      };

      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Parse error details for better error messages
        let errorMessage = 'Error al procesar la imagen con Gemini';
        try {
          const errorData = JSON.parse(errorText);
          const originalMessage = errorData.error?.message || errorText;
          
          // Translate common error messages to Spanish
          const lowerMessage = originalMessage.toLowerCase();
          if (lowerMessage.includes('quota') || lowerMessage.includes('resource_exhausted') || lowerMessage.includes('exceeded')) {
            errorMessage = 'Has excedido la cuota de uso de Gemini API. Por favor espera unos minutos o habilita un plan de pago para continuar.';
          } else if (lowerMessage.includes('not found') || lowerMessage.includes('not_found')) {
            errorMessage = 'El modelo de Gemini no está disponible actualmente. Por favor intenta más tarde.';
          } else if (lowerMessage.includes('api key') || lowerMessage.includes('api_key')) {
            errorMessage = 'La API key de Gemini no es válida o no está configurada correctamente.';
          } else {
            // Provide a simplified error message instead of the full technical details
            errorMessage = 'Error al procesar la imagen con Gemini. Por favor intenta de nuevo más tarde.';
          }
        } catch {
          // If parsing fails, use a generic error message
          errorMessage = 'Error al procesar la imagen. Por favor intenta de nuevo.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Extract the text from Gemini's response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text was extracted from the image');
      }

      // Parse the JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsedResult = JSON.parse(jsonMatch[0]);

      // Validate and structure the result
      return this.validateAndStructureResult(parsedResult);

    } catch (error) {
      throw error; // Re-throw error instead of falling back to simulation
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

  /**
   * Validate and structure the result from Gemini
   */
  private static validateAndStructureResult(result: unknown): GeminiResult {
    const resultObj = result as { date?: string; entries?: unknown[] };
    const structuredResult: GeminiResult = {
      date: resultObj.date || '',
      entries: []
    };

    if (resultObj.entries && Array.isArray(resultObj.entries)) {
      structuredResult.entries = resultObj.entries.map((entry: unknown) => {
        const entryObj = entry as { 
          ticket?: string; 
          licensePlate?: string; 
          brand?: string; 
          color?: string; 
          parkingSpace?: string; 
          observation?: string 
        };
        return {
          ticket: entryObj.ticket || '',
          licensePlate: entryObj.licensePlate || '',
          brand: entryObj.brand || '',
          color: entryObj.color || '',
          parkingSpace: entryObj.parkingSpace || '',
          observation: entryObj.observation || ''
        };
      });
    }

    return structuredResult;
  }

  /**
   * Simulate processing for demo purposes when API key is not available
   */
  private static async simulateProcessing(file: File): Promise<GeminiResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResult: GeminiResult = {
      date: "Martes 1° de Julio del 2025",
      entries: [
        {
          ticket: "8164",
          licensePlate: "NPB002",
          brand: "Geely",
          color: "Blanco",
          parkingSpace: "Cangaim80",
          observation: "out 11:45"
        },
        {
          ticket: "8165",
          licensePlate: "PSF088",
          brand: "Mazda",
          color: "Azul",
          parkingSpace: "ATP3-901",
          observation: "ATP3-101"
        },
        {
          ticket: "8166",
          licensePlate: "BYN 712",
          brand: "toyota",
          color: "Gris",
          parkingSpace: "ATP3-601",
          observation: "UP"
        },
        {
          ticket: "8173",
          licensePlate: "WJM 293",
          brand: "Nissan",
          color: "Blanco",
          parkingSpace: "ATP3-302",
          observation: "At P4-102"
        },
        {
          ticket: "8187",
          licensePlate: "CB6337",
          brand: "Geely",
          color: "Verde",
          parkingSpace: "Cargain 10.20",
          observation: "out 12:50"
        },
        {
          ticket: "8189",
          licensePlate: "CLC240",
          brand: "BMW",
          color: "Negro",
          parkingSpace: "Cungai 1201",
          observation: "out. 15:10"
        },
        {
          ticket: "8190",
          licensePlate: "AAUG91",
          brand: "",
          color: "Gris",
          parkingSpace: "Cunga 123",
          observation: "out. 15:40"
        },
        {
          ticket: "8192",
          licensePlate: "B+R591",
          brand: "BYD",
          color: "Blanco",
          parkingSpace: "Cungain 1349",
          observation: "out. 17.15."
        }
      ]
    };

    return mockResult;
  }
}
