import { api } from './apiClient';
import { Biomarker, LabResult } from '../../types';

// Maps backend risk_level → app riskLevel
function mapRiskLevel(r: string | null): Biomarker['riskLevel'] {
  if (r === 'abnormal') return 'high';
  if (r === 'unknown') return 'medium';
  return 'low';
}

// Maps backend trend → app trend (backend trend is value direction, not health direction)
function mapTrend(t: string | null): Biomarker['trend'] {
  if (t === 'increasing' || t === 'decreasing') return 'stable'; // can't infer health dir without context
  return 'stable';
}

function rowToBiomarker(r: any): Biomarker {
  return {
    id: r.id,
    name: r.name,
    value: parseFloat(r.value),
    unit: r.unit,
    category: r.category,
    trend: mapTrend(r.trend),
    riskLevel: mapRiskLevel(r.risk_level),
    lastUpdated: new Date(r.recorded_at ?? r.created_at),
  };
}

export class DataService {
  // ─── User profile ────────────────────────────────────────────────────────

  static async ensureUser(
    userId: string,
    email: string,
    firstName?: string,
    surname?: string,
    preferredName?: string,
  ): Promise<void> {
    await api.post(`/users/${userId}`, { email, firstName, surname, preferredName });
  }

  static async getProfile(userId: string): Promise<any | null> {
    try {
      return await api.get<any>(`/users/${userId}`);
    } catch (e: any) {
      if (e.message?.includes('404')) return null;
      throw e;
    }
  }

  static async updateProfile(userId: string, updates: {
    firstName?: string;
    surname?: string;
    preferredName?: string;
    username?: string;
    photoUrl?: string;
    dateOfBirth?: string;
    gender?: string;
    heightCm?: number;
    weightKg?: number;
    ethnicity?: string;
  }): Promise<any> {
    return api.put<any>(`/users/${userId}`, updates);
  }

  // ─── Biomarkers ──────────────────────────────────────────────────────────

  static async getBiomarkers(category?: string): Promise<Biomarker[]> {
    const path = category ? `/biomarkers?category=${category}` : '/biomarkers';
    const rows = await api.get<any[]>(path);
    return rows.map(rowToBiomarker);
  }

  static async addBiomarker(biomarker: {
    name: string;
    value: number;
    unit: string;
    category: string;
    referenceMin?: number;
    referenceMax?: number;
    recordedAt?: string;
    labResultId?: string;
  }): Promise<Biomarker> {
    const row = await api.post<any>('/biomarkers', biomarker);
    return rowToBiomarker(row);
  }

  static async deleteBiomarker(biomarkerId: string): Promise<void> {
    await api.delete(`/biomarkers/${biomarkerId}`);
  }

  // ─── Lab results (PDFs) ──────────────────────────────────────────────────
  // Note: backend lab_results are PDF documents; the app's LabResult type is individual test values.
  // These are used for the upload/processing flow only.

  static async getLabResultDocuments(): Promise<any[]> {
    return api.get<any[]>('/lab-results');
  }

  static async addLabResultDocument(data: {
    s3Key: string;
    fileName: string;
    labName?: string;
    reportDate?: string;
  }): Promise<any> {
    return api.post<any>('/lab-results', {
      s3_key: data.s3Key,
      file_name: data.fileName,
      lab_name: data.labName,
      report_date: data.reportDate,
    });
  }

  static async deleteLabResultDocument(labResultId: string): Promise<void> {
    await api.delete(`/lab-results/${labResultId}`);
  }

  // ─── AI chat ─────────────────────────────────────────────────────────────

  static async sendChatMessage(message: string): Promise<{ reply: string }> {
    return api.post<{ reply: string }>('/ai/chat', { message });
  }

  static async getChatHistory(): Promise<Array<{ role: string; content: string; created_at: string }>> {
    return api.get('/ai/history');
  }
}
