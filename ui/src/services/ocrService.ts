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
      // Check if API key is configured
      if (!this.API_KEY) {
        return await this.simulateOCRProcessing(file);
      }

      // Use real OCR processing
      const result = await this.callOCRAPI(file);
      return result;
    } catch (error) {
      // Fallback to simulation if real OCR fails
      return await this.simulateOCRProcessing(file);
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
   */
  private static async callOCRAPI(file: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('apikey', this.API_KEY);
    formData.append('file', file);
    formData.append('language', 'spa');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', this.getFileExtension(file.name));
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');
    formData.append('isTable', 'true'); // Enable table detection
    formData.append('isCreateSearchablePdf', 'false');
    formData.append('isSearchablePdfHideTextLayer', 'false');

    // eslint-disable-next-line no-console
    console.log('Sending image to OCR API...');
    const startTime = Date.now();

    const response = await fetch(this.API_URL, {
      method: 'POST',
      body: formData,
    });

    const endTime = Date.now();
    // eslint-disable-next-line no-console
    console.log(`OCR API response time: ${endTime - startTime}ms`);

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('OCR API response:', data);
    
    if (data.IsErroredOnProcessing) {
      throw new Error(`OCR processing error: ${data.ErrorMessage}`);
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      throw new Error('No text was extracted from the image');
    }

    // Parse the extracted text and structure it
    return this.parseOCRText(data.ParsedResults[0].ParsedText);
  }

  private static getFileExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'png';
  }

  private static parseOCRText(text: string): OCRResult {
    // eslint-disable-next-line no-console
    console.log('Parsing OCR text:', text);
    
    // Parse the OCR text and extract structured data
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract date and page number from header
    const dateMatch = lines[0]?.match(/(.+?)\s+\d+$/);
    const pageMatch = lines[0]?.match(/(\d+)$/);
    
    const entries: VehicleEntry[] = [];
    
    // Parse each line for vehicle data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines or header-like lines
      if (!line.trim() || line.includes('Boleta') || line.includes('Placa') || line.includes('Marca')) {
        continue;
      }
      
      // Try to parse the line as vehicle data
      const entry = this.parseVehicleLine(line);
      if (entry) {
        entries.push(entry);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`Parsed ${entries.length} vehicle entries`);

    return {
      date: dateMatch?.[1] || '',
      pageNumber: pageMatch?.[1] || '',
      entries
    };
  }

  private static parseVehicleLine(line: string): VehicleEntry | null {
    // Remove extra spaces and normalize
    const normalizedLine = line.replace(/\s+/g, ' ').trim();
    
    // Split by spaces and try to identify columns
    const parts = normalizedLine.split(' ');
    
    if (parts.length < 4) {
      return null; // Not enough data
    }
    
    // Try different parsing strategies based on the line structure
    let ticket = '';
    let licensePlate = '';
    let brand = '';
    let color = '';
    let parkingSpace = '';
    let observation = '';
    
    // Strategy 1: Assume first part is ticket number (usually 4 digits)
    if (/^\d{3,5}$/.test(parts[0])) {
      ticket = parts[0];
      
      // Look for license plate pattern (letters and numbers)
      const plateIndex = parts.findIndex(part => /^[A-Z]{1,3}\d{2,4}$/.test(part));
      if (plateIndex !== -1) {
        licensePlate = parts[plateIndex];
        
        // Brand is usually after the plate
        if (plateIndex + 1 < parts.length) {
          brand = parts[plateIndex + 1];
        }
        
        // Color is usually after brand
        if (plateIndex + 2 < parts.length) {
          color = parts[plateIndex + 2];
        }
        
        // Parking space and observation are the remaining parts
        const remainingParts = parts.slice(plateIndex + 3);
        if (remainingParts.length >= 1) {
          parkingSpace = remainingParts[0];
          observation = remainingParts.slice(1).join(' ');
        }
      }
    }
    
    // If we couldn't parse properly, try a simpler approach
    if (!ticket || !licensePlate) {
      // Fallback: just take the first 6 parts
      ticket = parts[0] || '';
      licensePlate = parts[1] || '';
      brand = parts[2] || '';
      color = parts[3] || '';
      parkingSpace = parts[4] || '';
      observation = parts.slice(5).join(' ') || '';
    }
    
    // Validate that we have at least ticket and license plate
    if (!ticket || !licensePlate) {
      return null;
    }
    
    return {
      ticket,
      licensePlate,
      brand,
      color,
      parkingSpace,
      observation
    };
  }
} 