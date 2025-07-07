import { Biomarker } from '../screens/body-map/organs/types';

export interface ProcessedDocument {
  id: string;
  name: string;
  type:
    | 'blood_test'
    | 'urine_test'
    | 'lipid_panel'
    | 'metabolic_panel'
    | 'thyroid_test'
    | 'unknown';
  uploadDate: Date;
  extractedBiomarkers: ExtractedBiomarker[];
  confidence: number; // 0-1 confidence score
  rawOcrText?: string;
  processingTimeMs?: number;
}

export interface ExtractedBiomarker {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string;
  organSystem: 'heart' | 'liver' | 'kidneys' | 'pancreas' | 'thyroid';
  confidence: number;
  status?: 'normal' | 'low' | 'high' | 'critical';
  rawText?: string; // Original text from document
}

// Google Cloud Vision API Configuration
const GOOGLE_CLOUD_VISION_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || 'your-api-key-here';
const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;

// OpenAI API Configuration
const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class DocumentProcessor {
  /**
   * Extract text from document using Google Cloud Vision OCR
   */
  static async extractTextFromDocument(uri: string): Promise<string> {
    try {
      const startTime = Date.now();

      // Check if API key is configured
      if (
        !GOOGLE_CLOUD_VISION_API_KEY ||
        GOOGLE_CLOUD_VISION_API_KEY === 'your-api-key-here'
      ) {
        console.warn(
          'Google Cloud Vision API key not configured, using mock data',
        );
        return this.getMockOcrText();
      }

      // Convert image to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      const base64Content = base64.split(',')[1]; // Remove data:image/... prefix

      // Call Google Cloud Vision API
      const visionResponse = await fetch(GOOGLE_VISION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Content,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      });

      if (!visionResponse.ok) {
        throw new Error(`Vision API error: ${visionResponse.status}`);
      }

      const visionData = await visionResponse.json();

      if (visionData.responses?.[0]?.fullTextAnnotation?.text) {
        const extractedText = visionData.responses[0].fullTextAnnotation.text;
        console.log(`OCR completed in ${Date.now() - startTime}ms`);
        return extractedText;
      } else {
        throw new Error('No text detected in document');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      console.warn('Falling back to mock data due to OCR error');
      return this.getMockOcrText();
    }
  }

  /**
   * Convert blob to base64
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Structure raw OCR text into biomarkers using OpenAI GPT
   */
  static async structureBiomarkersWithGPT(
    rawText: string,
  ): Promise<ExtractedBiomarker[]> {
    try {
      const startTime = Date.now();

      // Check if API key is configured
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
        console.warn('OpenAI API key not configured, using fallback parsing');
        return this.parseBiomarkersFallback(rawText);
      }

      const prompt = `You are a biomarker parsing assistant. Extract all biomarker results from the medical document text below. 

For each biomarker found, return:
- biomarker name (standardized)
- numerical value
- unit of measurement
- reference range (if present)
- related organ/system (heart, liver, kidneys, pancreas, or thyroid)
- status (normal, low, high, critical)

Return ONLY a JSON array. Example format:
[
  {
    "name": "ALT",
    "value": 43,
    "unit": "U/L",
    "referenceRange": "10-40",
    "organSystem": "liver",
    "status": "high"
  }
]

--- RAW MEDICAL TEXT START ---
${rawText}
--- RAW MEDICAL TEXT END ---`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const gptResponse = data.choices?.[0]?.message?.content;

      if (!gptResponse) {
        throw new Error('No response from GPT');
      }

      // Parse JSON response
      let biomarkers: any[] = [];
      try {
        // Clean the response (remove markdown formatting if present)
        const cleanResponse = gptResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '');
        biomarkers = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error('Failed to parse GPT response as JSON');
      }

      // Convert to ExtractedBiomarker format
      const extractedBiomarkers: ExtractedBiomarker[] = biomarkers.map(
        (b: any) => ({
          name: b.name || 'Unknown',
          value: parseFloat(b.value) || 0,
          unit: b.unit || '',
          referenceRange: b.referenceRange,
          organSystem: b.organSystem || 'liver',
          confidence: 0.9, // High confidence for GPT parsing
          status: b.status || 'normal',
          rawText: `${b.name}: ${b.value} ${b.unit}`,
        }),
      );

      console.log(`GPT structuring completed in ${Date.now() - startTime}ms`);
      return extractedBiomarkers;
    } catch (error) {
      console.error('GPT Error:', error);
      console.warn('Falling back to manual parsing due to GPT error');
      return this.parseBiomarkersFallback(rawText);
    }
  }

  /**
   * Fallback biomarker parsing (regex-based)
   */
  private static parseBiomarkersFallback(text: string): ExtractedBiomarker[] {
    const biomarkers: ExtractedBiomarker[] = [];
    const lines = text.split('\n');

    // Biomarker patterns and mappings
    const biomarkerMappings: {
      [key: string]: { organSystem: string; unit: string };
    } = {
      ALT: { organSystem: 'liver', unit: 'U/L' },
      AST: { organSystem: 'liver', unit: 'U/L' },
      ALP: { organSystem: 'liver', unit: 'U/L' },
      Bilirubin: { organSystem: 'liver', unit: 'mg/dL' },
      Creatinine: { organSystem: 'kidneys', unit: 'mg/dL' },
      eGFR: { organSystem: 'kidneys', unit: 'mL/min/1.73m²' },
      BUN: { organSystem: 'kidneys', unit: 'mg/dL' },
      Glucose: { organSystem: 'pancreas', unit: 'mg/dL' },
      HbA1c: { organSystem: 'pancreas', unit: '%' },
      Cholesterol: { organSystem: 'heart', unit: 'mg/dL' },
      LDL: { organSystem: 'heart', unit: 'mg/dL' },
      HDL: { organSystem: 'heart', unit: 'mg/dL' },
      Triglycerides: { organSystem: 'heart', unit: 'mg/dL' },
      TSH: { organSystem: 'thyroid', unit: 'mIU/L' },
      T3: { organSystem: 'thyroid', unit: 'pg/mL' },
      T4: { organSystem: 'thyroid', unit: 'ng/dL' },
    };

    for (const line of lines) {
      // Enhanced regex patterns
      const patterns = [
        /([A-Za-z\s\-]+):\s*([0-9.]+)\s*([A-Za-z\/²³μ%]+)/,
        /([A-Za-z\s\-]+)\s+([0-9.]+)\s+([A-Za-z\/²³μ%]+)/,
        /([A-Za-z\s\-]+)\s*([0-9.]+)\s*([A-Za-z\/²³μ%]+)/,
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const [, name, valueStr, unit] = match;
          const cleanName = name.trim();
          const value = parseFloat(valueStr);

          // Find matching biomarker
          const mapping = Object.keys(biomarkerMappings).find(key =>
            cleanName.toLowerCase().includes(key.toLowerCase()),
          );

          if (mapping && !isNaN(value)) {
            const biomarkerInfo = biomarkerMappings[mapping];
            biomarkers.push({
              name: mapping,
              value,
              unit: biomarkerInfo.unit,
              organSystem: biomarkerInfo.organSystem as any,
              confidence: 0.7, // Lower confidence for regex parsing
              rawText: line.trim(),
            });
            break; // Move to next line
          }
        }
      }
    }

    return biomarkers;
  }

  /**
   * Mock OCR text for development/fallback
   */
  private static getMockOcrText(): string {
    return `
      COMPREHENSIVE METABOLIC PANEL
      Patient: John Doe
      Date: ${new Date().toLocaleDateString()}
      
      GLUCOSE: 92 mg/dL (Reference: 70-99)
      CREATININE: 0.9 mg/dL (Reference: 0.6-1.2)
      eGFR: 105 mL/min/1.73m² (Reference: >90)
      ALT: 25 U/L (Reference: 7-56)
      AST: 28 U/L (Reference: 10-40)
      
      LIPID PANEL
      TOTAL CHOLESTEROL: 180 mg/dL (Reference: <200)
      LDL-C: 95 mg/dL (Reference: <100)
      HDL-C: 65 mg/dL (Reference: >40)
      TRIGLYCERIDES: 110 mg/dL (Reference: <150)
      
      THYROID FUNCTION
      TSH: 2.5 mIU/L (Reference: 0.4-4.0)
      FREE T4: 1.2 ng/dL (Reference: 0.8-1.8)
    `;
  }

  /**
   * Main processing function
   */
  static async processDocument(
    uri: string,
    fileName?: string,
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();

    try {
      console.log('Processing document:', fileName);

      // Step 1: Extract text using Google Cloud Vision OCR
      const extractedText = await this.extractTextFromDocument(uri);
      console.log('OCR Text extracted, length:', extractedText.length);

      // Step 2: Structure biomarkers using OpenAI GPT
      const extractedBiomarkers =
        await this.structureBiomarkersWithGPT(extractedText);
      console.log('Biomarkers extracted:', extractedBiomarkers.length);

      // Step 3: Determine document type
      const documentType = this.determineDocumentType(extractedBiomarkers);

      const processingTime = Date.now() - startTime;

      return {
        id: Date.now().toString(),
        name: fileName || 'Medical Document',
        type: documentType,
        uploadDate: new Date(),
        extractedBiomarkers,
        confidence: extractedBiomarkers.length > 0 ? 0.9 : 0.1,
        rawOcrText: extractedText,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process document. Please try again.');
    }
  }

  /**
   * Determine document type based on biomarkers found
   */
  private static determineDocumentType(
    biomarkers: ExtractedBiomarker[],
  ): ProcessedDocument['type'] {
    const organSystems = new Set(biomarkers.map(b => b.organSystem));

    if (organSystems.has('heart') && organSystems.has('liver')) {
      return 'blood_test';
    } else if (organSystems.has('heart')) {
      return 'lipid_panel';
    } else if (organSystems.has('pancreas')) {
      return 'metabolic_panel';
    } else if (organSystems.has('thyroid')) {
      return 'thyroid_test';
    } else if (organSystems.has('kidneys')) {
      return 'blood_test';
    }

    return 'unknown';
  }

  /**
   * Update organ data with extracted biomarkers
   */
  static updateOrganBiomarkers(extractedBiomarkers: ExtractedBiomarker[]): {
    [organId: string]: Biomarker[];
  } {
    const updatedOrgans: { [organId: string]: Biomarker[] } = {};

    for (const extracted of extractedBiomarkers) {
      const organId = extracted.organSystem;

      if (!updatedOrgans[organId]) {
        updatedOrgans[organId] = [];
      }

      // Convert to standard biomarker format
      const mapExtractedStatus = (status?: string): 'normal' | 'borderline' | 'abnormal' => {
        if (!status) return 'normal';
        switch (status) {
          case 'low':
          case 'high':
            return 'abnormal';
          case 'critical':
            return 'abnormal';
          case 'normal':
            return 'normal';
          default:
            return 'normal';
        }
      };

      const biomarker: Biomarker = {
        name: extracted.name,
        value: extracted.value,
        unit: extracted.unit,
        range:
          extracted.referenceRange || this.getStandardRange(extracted.name),
        status: extracted.status 
          ? mapExtractedStatus(extracted.status)
          : this.determineStatus(extracted.name, extracted.value),
      };

      updatedOrgans[organId].push(biomarker);
    }

    return updatedOrgans;
  }

  /**
   * Get standard reference range for a biomarker
   */
  private static getStandardRange(biomarkerName: string): string {
    const ranges: { [key: string]: string } = {
      ALT: '7-56 U/L',
      AST: '10-40 U/L',
      ALP: '44-147 U/L',
      Bilirubin: '0.1-1.2 mg/dL',
      Creatinine: '0.6-1.2 mg/dL',
      eGFR: '>90 mL/min/1.73m²',
      BUN: '6-20 mg/dL',
      Glucose: '70-99 mg/dL',
      HbA1c: '<5.7%',
      'Total Cholesterol': '<200 mg/dL',
      LDL: '<100 mg/dL',
      HDL: '>40 mg/dL',
      Triglycerides: '<150 mg/dL',
      TSH: '0.4-4.0 mIU/L',
      'Free T3': '2.0-4.4 pg/mL',
      'Free T4': '0.8-1.8 ng/dL',
    };

    return ranges[biomarkerName] || 'Reference range not available';
  }

  /**
   * Determine biomarker status
   */
  private static determineStatus(
    biomarkerName: string,
    value: number,
  ): 'normal' | 'borderline' | 'abnormal' {
    // Simplified status determination - in a real app, you'd have more complex logic
    const normalRanges: { [key: string]: { min: number; max: number } } = {
      ALT: { min: 7, max: 56 },
      AST: { min: 10, max: 40 },
      Creatinine: { min: 0.6, max: 1.2 },
      Glucose: { min: 70, max: 99 },
      'Total Cholesterol': { min: 0, max: 200 },
      LDL: { min: 0, max: 100 },
      HDL: { min: 40, max: 1000 },
      TSH: { min: 0.4, max: 4.0 },
    };

    const range = normalRanges[biomarkerName];
    if (!range) return 'normal';

    if (value < range.min || value > range.max) {
      return 'abnormal';
    } else if (value < range.min * 1.1 || value > range.max * 0.9) {
      return 'borderline';
    }

    return 'normal';
  }
}
