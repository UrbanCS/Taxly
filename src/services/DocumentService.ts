import { supabase } from './supabaseClient';

export interface ProcessedDocument {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error' | 'review_needed';
  filePath?: string;
  extractedData?: ExtractedData;
  confidence?: number;
  processingTime?: number;
  aiInsights?: string[];
  tags?: string[];
  textSnippet?: string;
  errorMessage?: string;
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

type ExtractionResult = {
  text: string;
  confidence: number;
};

type ParsedDocumentData = {
  extractedData: ExtractedData;
  confidence: number;
  aiInsights: string[];
  tags: string[];
  textSnippet: string;
  documentType: string;
};

const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_DOCUMENTS_BUCKET || 'tax-documents';

export class DocumentService {
  private static readonly SUPPORTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv'
  ];

  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024;

  public static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type || 'unknown'}. Supported types: PDF, JPG, PNG, WEBP, XLSX, XLS, TXT, CSV`
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

  public static async processAndStoreDocument(file: File, userId: string): Promise<ProcessedDocument> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const startedAt = performance.now();
    const filePath = await this.uploadToStorage(file, userId);

    try {
      const extraction = await this.extractDocumentText(file);
      const parsed = this.parseExtractedData(extraction.text, file.name, file.type, extraction.confidence);
      const processingTime = (performance.now() - startedAt) / 1000;
      const status = parsed.confidence >= 85 ? 'completed' : 'review_needed';

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          document_type: parsed.documentType,
          status,
          amount: parsed.extractedData.amount,
          vendor: parsed.extractedData.vendor,
          transaction_date: parsed.extractedData.date?.toISOString().split('T')[0],
          category: parsed.extractedData.category,
          description: parsed.extractedData.description,
          confidence: Math.round(parsed.confidence),
          tax_deductible: parsed.extractedData.taxDeductible ?? false,
          receipt_type: parsed.extractedData.receiptType,
          extracted_data: {
            textSnippet: parsed.textSnippet,
            aiInsights: parsed.aiInsights,
            tags: parsed.tags,
            extractedData: {
              ...parsed.extractedData,
              date: parsed.extractedData.date?.toISOString() || null
            }
          },
          processing_time: processingTime
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date(data.created_at),
        status,
        filePath,
        extractedData: parsed.extractedData,
        confidence: Math.round(parsed.confidence),
        processingTime,
        aiInsights: parsed.aiInsights,
        tags: parsed.tags,
        textSnippet: parsed.textSnippet
      };
    } catch (error) {
      const processingTime = (performance.now() - startedAt) / 1000;
      const message = error instanceof Error ? error.message : 'Unknown processing error';

      const { data } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          status: 'error',
          description: message,
          confidence: 0,
          extracted_data: {
            textSnippet: '',
            aiInsights: ['File stored successfully, but extraction failed.'],
            tags: ['processing-error']
          },
          processing_time: processingTime
        })
        .select()
        .single();

      return {
        id: data?.id || this.generateId(),
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
        status: 'error',
        filePath,
        processingTime,
        aiInsights: ['File stored successfully, but extraction failed.'],
        tags: ['processing-error'],
        errorMessage: message
      };
    }
  }

  public static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || 'Failed to generate signed URL');
    }

    return data.signedUrl;
  }

  public static async deleteStoredDocument(documentId: string, filePath?: string): Promise<void> {
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (storageError) {
        throw new Error(storageError.message);
      }
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw new Error(error.message);
    }
  }

  private static async uploadToStorage(file: File, userId: string): Promise<string> {
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${Date.now()}-${sanitizedFilename}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      if (error.message.toLowerCase().includes('bucket')) {
        throw new Error(
          `Storage bucket "${STORAGE_BUCKET}" is not configured. Create it in Supabase Storage before uploading documents.`
        );
      }

      throw new Error(error.message);
    }

    return filePath;
  }

  private static async extractDocumentText(file: File): Promise<ExtractionResult> {
    if (file.type === 'application/pdf') {
      return this.extractTextFromPDF(file);
    }

    if (file.type.startsWith('image/')) {
      return this.extractTextFromImage(file);
    }

    if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'text/csv'
    ) {
      return this.extractTextFromSpreadsheet(file);
    }

    if (file.type === 'text/plain') {
      const text = await file.text();
      return { text, confidence: text.trim() ? 98 : 0 };
    }

    throw new Error(`No extractor is configured for ${file.type}`);
  }

  private static async extractTextFromImage(file: File): Promise<ExtractionResult> {
    const { recognize } = await import('tesseract.js');
    const result = await recognize(file, 'eng');
    const text = result.data.text || '';
    const confidence = Number.isFinite(result.data.confidence) ? result.data.confidence : 0;
    return { text, confidence };
  }

  private static async extractTextFromPDF(file: File): Promise<ExtractionResult> {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let text = '';
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      text += `${pageText}\n`;
    }

    return {
      text: text.trim(),
      confidence: text.trim() ? 92 : 0
    };
  }

  private static async extractTextFromSpreadsheet(file: File): Promise<ExtractionResult> {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const text = workbook.SheetNames
      .map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Array<string | number | boolean>>(sheet, { header: 1 });
        return rows.map((row) => row.join(' ')).join('\n');
      })
      .join('\n');

    return {
      text: text.trim(),
      confidence: text.trim() ? 95 : 0
    };
  }

  private static parseExtractedData(
    rawText: string,
    filename: string,
    fileType: string,
    extractionConfidence: number
  ): ParsedDocumentData {
    const text = rawText.replace(/\s+/g, ' ').trim();
    const amount = this.extractAmount(text);
    const date = this.extractDate(text);
    const vendor = this.extractVendor(text, filename);
    const category = this.extractCategory(text, filename);
    const receiptType = this.inferReceiptType(text, category);
    const taxDeductible = receiptType === 'business' || receiptType === 'charitable' || receiptType === 'medical';
    const description = this.buildDescription(text, vendor, category);
    const textSnippet = text.slice(0, 500);
    const baseConfidence = extractionConfidence > 0 ? extractionConfidence : 60;
    const matchedSignals = [amount, date, vendor, category].filter(Boolean).length;
    const confidence = Math.min(99, Math.max(35, baseConfidence * 0.6 + matchedSignals * 10));
    const documentType = this.inferDocumentType(text, filename, fileType);
    const tags = [
      documentType,
      category.toLowerCase().replace(/\s+/g, '-'),
      taxDeductible ? 'tax-deductible' : 'review'
    ];

    const aiInsights = [
      textSnippet ? 'Text was extracted from the uploaded document.' : 'The file was stored, but little or no text could be extracted.',
      amount ? `Detected an amount of $${amount.toFixed(2)}.` : 'No clear amount was detected automatically.',
      vendor ? `Vendor or issuer identified as ${vendor}.` : 'Vendor or issuer could not be confidently identified.',
      confidence >= 85 ? 'Extraction quality is high enough to use directly.' : 'Extraction should be reviewed before filing.'
    ];

    return {
      extractedData: {
        amount,
        date,
        vendor,
        category,
        description,
        taxDeductible,
        receiptType
      },
      confidence,
      aiInsights,
      tags,
      textSnippet,
      documentType
    };
  }

  private static extractAmount(text: string): number | undefined {
    const matches = Array.from(text.matchAll(/(?:CAD\s*)?\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})|\d+\.\d{2})/gi))
      .map((match) => Number(match[1].replace(/,/g, '')))
      .filter((value) => Number.isFinite(value) && value > 0 && value < 1_000_000);

    if (matches.length === 0) {
      return undefined;
    }

    return matches.sort((a, b) => b - a)[0];
  }

  private static extractDate(text: string): Date | undefined {
    const patterns = [
      /\b(\d{4})-(\d{2})-(\d{2})\b/,
      /\b(\d{2})\/(\d{2})\/(\d{4})\b/,
      /\b([A-Z][a-z]+ \d{1,2}, \d{4})\b/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (!match) continue;

      const value = match[0];
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return undefined;
  }

  private static extractVendor(text: string, filename: string): string | undefined {
    const lines = text
      .split(/[\n\r]+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const candidate = lines.find((line) => {
      const lower = line.toLowerCase();
      return (
        line.length >= 3 &&
        line.length <= 60 &&
        !/\d{2,}/.test(line) &&
        !lower.includes('invoice') &&
        !lower.includes('receipt') &&
        !lower.includes('total')
      );
    });

    if (candidate) {
      return candidate;
    }

    return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  }

  private static extractCategory(text: string, filename: string): string {
    const combined = `${text} ${filename}`.toLowerCase();

    if (/(meal|restaurant|coffee|cafe|lunch|dinner)/.test(combined)) return 'Meals & Entertainment';
    if (/(flight|hotel|uber|taxi|travel|airbnb)/.test(combined)) return 'Travel';
    if (/(office|printer|staples|paper|supplies)/.test(combined)) return 'Office Supplies';
    if (/(software|laptop|computer|monitor|hardware|equipment)/.test(combined)) return 'Equipment';
    if (/(doctor|dental|medical|clinic|pharmacy)/.test(combined)) return 'Medical';
    if (/(donation|charity|foundation|nonprofit)/.test(combined)) return 'Charitable';
    if (/(invoice|consulting|services|professional)/.test(combined)) return 'Professional Services';

    return 'General Business';
  }

  private static inferReceiptType(
    text: string,
    category: string
  ): 'business' | 'personal' | 'medical' | 'charitable' {
    const lower = text.toLowerCase();

    if (category === 'Medical' || /medical|clinic|pharmacy/.test(lower)) return 'medical';
    if (category === 'Charitable' || /charity|donation/.test(lower)) return 'charitable';
    if (/personal use|gift|family/.test(lower)) return 'personal';
    return 'business';
  }

  private static buildDescription(text: string, vendor?: string, category?: string): string | undefined {
    if (!text) return undefined;
    const prefix = [vendor, category].filter(Boolean).join(' - ');
    const snippet = text.slice(0, 120);
    return prefix ? `${prefix}: ${snippet}` : snippet;
  }

  private static inferDocumentType(text: string, filename: string, fileType: string): string {
    const combined = `${text} ${filename}`.toLowerCase();

    if (/invoice/.test(combined)) return 'invoice';
    if (/receipt/.test(combined) || fileType.startsWith('image/')) return 'receipt';
    if (/tax|t4|td1|assessment/.test(combined)) return 'tax-document';
    if (/bank|statement|account/.test(combined)) return 'statement';
    if (/spreadsheet|csv|xlsx|xls/.test(`${filename} ${fileType}`.toLowerCase())) return 'spreadsheet';

    return 'document';
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
