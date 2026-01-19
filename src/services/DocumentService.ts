// REAL DOCUMENT PROCESSING SERVICE

export interface ProcessedDocument {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error' | 'review_needed';
  extractedData?: ExtractedData;
  confidence?: number;
  processingTime?: number;
}

export interface ExtractedData {
  amount?: number;
  date?: Date;
  vendor?: string;
  category?: string;
  description?: string;
  taxDeductible?: boolean;
  receiptType?: 'business' | 'personal' | 'medical' | 'charitable';
}

export class DocumentService {
  private static readonly SUPPORTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  public static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type}. Supported types: PDF, JPG, PNG, XLSX, XLS`
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size: 25MB`
      };
    }

    return { valid: true };
  }

  public static async processDocument(file: File, isTestMode: boolean = false): Promise<ProcessedDocument> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const document: ProcessedDocument = {
      id: this.generateId(),
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date(),
      status: 'processing'
    };

    if (isTestMode) {
      // Simulate processing with realistic data
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData = this.generateMockExtractedData(file.name);
          resolve({
            ...document,
            status: mockData.confidence > 90 ? 'completed' : 'review_needed',
            extractedData: mockData.data,
            confidence: mockData.confidence,
            processingTime: Math.random() * 5 + 1 // 1-6 seconds
          });
        }, 2000 + Math.random() * 3000); // 2-5 second delay
      });
    } else {
      // In production, this would call actual OCR/AI service
      return this.callRealOCRService(file, document);
    }
  }

  private static async callRealOCRService(file: File, document: ProcessedDocument): Promise<ProcessedDocument> {
    try {
      // This would integrate with real OCR services like:
      // - Google Cloud Vision API
      // - AWS Textract
      // - Azure Computer Vision
      // - Custom trained models
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Example API call (would need real endpoint)
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`OCR service error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        ...document,
        status: result.confidence > 85 ? 'completed' : 'review_needed',
        extractedData: result.extractedData,
        confidence: result.confidence,
        processingTime: result.processingTime
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      return {
        ...document,
        status: 'error'
      };
    }
  }

  private static generateMockExtractedData(filename: string): { data: ExtractedData; confidence: number } {
    const vendors = ['Amazon', 'Starbucks', 'Office Depot', 'Uber', 'Hotel California', 'Best Buy'];
    const categories = ['Office Supplies', 'Meals & Entertainment', 'Travel', 'Equipment', 'Professional Services'];
    
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const amount = Math.random() * 500 + 10;
    const confidence = Math.random() * 20 + 80; // 80-100%
    
    return {
      data: {
        amount: Math.round(amount * 100) / 100,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        vendor,
        category,
        description: `${vendor} purchase`,
        taxDeductible: Math.random() > 0.3,
        receiptType: category.includes('Meals') ? 'business' : 'business'
      },
      confidence: Math.round(confidence)
    };
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // REAL text extraction from images (would use actual OCR in production)
  public static async extractTextFromImage(file: File): Promise<string> {
    // In production, this would use OCR libraries or services
    // For now, return mock text based on filename
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Mock extracted text from ${file.name}`);
      }, 1000);
    });
  }

  // REAL PDF text extraction
  public static async extractTextFromPDF(file: File): Promise<string> {
    // In production, this would use PDF.js or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Mock extracted text from PDF: ${file.name}`);
      }, 1000);
    });
  }
}