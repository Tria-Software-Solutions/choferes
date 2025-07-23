// OCR Service for processing vehicle logbook images
// This service uses a cloud OCR API to extract structured data from images

export interface OCRResult {
  date?: string;
  pageNumber?: string;
  entries: VehicleEntry[];
}

export interface VehicleEntry {
  ticket: string;
  licensePlate: string;
  brand: string;
  color: string;
  parkingSpace: string;
  observation: string;
}

export class OCRService {
  private static readonly API_KEY = process.env.REACT_APP_OCR_API_KEY || '';
  private static readonly API_URL = process.env.REACT_APP_OCR_API_URL || 'https://api.ocr.space/parse/image';

  /**
   * Process an image file and extract vehicle data using OCR
   */
  static async processImage(file: File): Promise<OCRResult> {
    try {
      // For demo purposes, we'll simulate OCR processing
      // In production, you would use a real OCR API like Google Vision, Azure Computer Vision, or OCR.space
      
      const result = await this.simulateOCRProcessing(file);
      return result;
    } catch (error) {
      throw new Error('Failed to process image. Please try again.');
    }
  }

  /**
   * Simulate OCR processing for demo purposes
   * In production, replace this with actual OCR API calls
   */
  private static async simulateOCRProcessing(file: File): Promise<OCRResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock data based on the example image
    return {
      date: "Martes 1° de Julio del 2025",
      pageNumber: "108",
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
  }

  /**
   * Real OCR implementation using OCR.space API
   * Uncomment and configure for production use
   */
  /*
  private static async callOCRAPI(file: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('apikey', this.API_KEY);
    formData.append('file', file);
    formData.append('language', 'spa');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'png');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const response = await fetch(this.API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.IsErroredOnProcessing) {
      throw new Error(`OCR processing error: ${data.ErrorMessage}`);
    }

    // Parse the extracted text and structure it
    return this.parseOCRText(data.ParsedResults[0].ParsedText);
  }

  private static parseOCRText(text: string): OCRResult {
    // Parse the OCR text and extract structured data
    // This would need custom logic based on the specific format of your logbook
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract date and page number from header
    const dateMatch = lines[0]?.match(/(.+?)\s+\d+$/);
    const pageMatch = lines[0]?.match(/(\d+)$/);
    
    const entries: VehicleEntry[] = [];
    
    // Parse each line for vehicle data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Custom parsing logic based on your logbook format
      // This is a simplified example
      const parts = line.split(/\s+/);
      if (parts.length >= 6) {
        entries.push({
          ticket: parts[0],
          licensePlate: parts[1],
          brand: parts[2],
          color: parts[3],
          parkingSpace: parts[4],
          observation: parts.slice(5).join(' ')
        });
      }
    }

    return {
      date: dateMatch?.[1] || '',
      pageNumber: pageMatch?.[1] || '',
      entries
    };
  }
  */
} 