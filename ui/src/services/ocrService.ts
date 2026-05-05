// OCR Service for processing vehicle logbook images
// This service uses Gemini Vision API to extract structured data from images

import { GeminiVisionService } from './geminiVisionService';

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
  /**
   * Process an image file and extract vehicle data using Gemini Vision API
   */
  static async processImage(file: File): Promise<OCRResult> {
    try {
      // eslint-disable-next-line no-console
      console.log('Starting OCR processing with Gemini Vision API...');
      
      // Use Gemini Vision API for processing
      const geminiResult = await GeminiVisionService.processImage(file);
      
      // eslint-disable-next-line no-console
      console.log('Gemini Vision result:', geminiResult);
      
      // Convert Gemini result to OCR result format
      const ocrResult: OCRResult = {
        date: geminiResult.date,
        entries: geminiResult.entries.map(entry => ({
          ticket: entry.ticket,
          licensePlate: entry.licensePlate,
          brand: entry.brand,
          color: entry.color,
          parkingSpace: entry.parkingSpace,
          observation: entry.observation
        }))
      };
      
      // eslint-disable-next-line no-console
      console.log('Converted OCR result:', ocrResult);
      return ocrResult;
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in OCR processing:', error);
      throw error;
    }
  }


} 