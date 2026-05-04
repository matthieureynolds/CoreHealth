import { api } from './apiClient';
import { Allergy, Biomarker, LabResult } from '../../types';

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

function rowToAllergy(r: any): Allergy {
  return {
    id: r.id,
    name: r.name,
    severity: r.severity === 'life_threatening' ? 'severe' : r.severity, // map DB value to app type
    reaction: r.reaction ?? undefined,
    status: r.status,
    startDate: r.start_date ? new Date(r.start_date).toISOString() : new Date(r.created_at).toISOString(),
    endDate: r.end_date ? new Date(r.end_date).toISOString() : undefined,
    notes: r.notes ?? undefined,
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

  static async deleteAccount(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
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

  static async syncProfileData(userId: string, profileData: any): Promise<void> {
    await api.put(`/users/${userId}/profile-data`, profileData);
  }

  static async logSymptom(userId: string, symptom: {
    type: string;
    category: string;
    severity: number;
    duration?: string;
    location?: string;
    notes?: string;
    medications?: string[];
    factors?: string[];
    loggedAt?: string;
  }): Promise<void> {
    await api.post(`/users/${userId}/symptoms`, symptom);
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

  /**
   * Request a presigned S3 upload URL for a lab result PDF/image.
   * Returns { labResultId, uploadUrl } — client must PUT the file to uploadUrl.
   */
  static async requestLabResultUpload(data: {
    fileName: string;
    fileType: string;
    labName?: string;
    reportDate?: string;
  }): Promise<{ labResultId: string; uploadUrl: string }> {
    return api.post<{ labResultId: string; uploadUrl: string }>('/lab-results', {
      fileName: data.fileName,
      fileType: data.fileType,
      labName: data.labName ?? null,
      reportDate: data.reportDate ?? null,
    });
  }

  static async deleteLabResultDocument(labResultId: string): Promise<void> {
    await api.delete(`/lab-results/${labResultId}`);
  }

  // ─── Allergies ───────────────────────────────────────────────────────────

  static async getAllergies(userId: string): Promise<Allergy[]> {
    const rows = await api.get<any[]>(`/users/${userId}/allergies`);
    return rows.map(rowToAllergy);
  }

  static async addAllergy(userId: string, allergy: Omit<Allergy, 'id' | 'attachments'>): Promise<Allergy> {
    const row = await api.post<any>(`/users/${userId}/allergies`, {
      name: allergy.name,
      severity: allergy.severity,
      reaction: allergy.reaction,
      status: allergy.status,
      startDate: allergy.startDate,
      endDate: allergy.endDate,
      notes: allergy.notes,
    });
    return rowToAllergy(row);
  }

  static async updateAllergy(userId: string, allergyId: string, updates: Partial<Omit<Allergy, 'id' | 'attachments'>>): Promise<Allergy> {
    const row = await api.put<any>(`/users/${userId}/allergies/${allergyId}`, {
      name: updates.name,
      severity: updates.severity,
      reaction: updates.reaction,
      status: updates.status,
      startDate: updates.startDate,
      endDate: updates.endDate,
      notes: updates.notes,
    });
    return rowToAllergy(row);
  }

  static async deleteAllergy(userId: string, allergyId: string): Promise<void> {
    await api.delete(`/users/${userId}/allergies/${allergyId}`);
  }

  // ─── Medications ─────────────────────────────────────────────────────────

  static async getMedications(userId: string): Promise<any[]> {
    return api.get<any[]>(`/users/${userId}/medications`);
  }

  static async addMedication(userId: string, data: {
    name: string; dosage?: string; frequency?: string;
    startDate?: string; endDate?: string; notes?: string;
  }): Promise<any> {
    return api.post<any>(`/users/${userId}/medications`, data);
  }

  static async updateMedication(userId: string, medicationId: string, data: Partial<{
    name: string; dosage: string; frequency: string;
    startDate: string; endDate: string; notes: string;
  }>): Promise<any> {
    return api.put<any>(`/users/${userId}/medications/${medicationId}`, data);
  }

  static async deleteMedication(userId: string, medicationId: string): Promise<void> {
    await api.delete(`/users/${userId}/medications/${medicationId}`);
  }

  // ─── Conditions ───────────────────────────────────────────────────────────

  static async getConditions(userId: string): Promise<any[]> {
    return api.get<any[]>(`/users/${userId}/conditions`);
  }

  static async addCondition(userId: string, data: {
    name: string; severity?: string; status?: string;
    diagnosedDate?: string; resolvedDate?: string; notes?: string;
  }): Promise<any> {
    return api.post<any>(`/users/${userId}/conditions`, data);
  }

  static async updateCondition(userId: string, conditionId: string, data: Partial<{
    name: string; severity: string; status: string;
    diagnosedDate: string; resolvedDate: string; notes: string;
  }>): Promise<any> {
    return api.put<any>(`/users/${userId}/conditions/${conditionId}`, data);
  }

  static async deleteCondition(userId: string, conditionId: string): Promise<void> {
    await api.delete(`/users/${userId}/conditions/${conditionId}`);
  }

  // ─── Vaccinations ─────────────────────────────────────────────────────────

  static async getVaccinations(userId: string): Promise<any[]> {
    return api.get<any[]>(`/users/${userId}/vaccinations`);
  }

  static async addVaccination(userId: string, data: {
    name: string; date: string; nextDue?: string;
    location?: string; batchNumber?: string; notes?: string;
  }): Promise<any> {
    return api.post<any>(`/users/${userId}/vaccinations`, data);
  }

  static async updateVaccination(userId: string, vaccinationId: string, data: Partial<{
    name: string; date: string; nextDue: string;
    location: string; batchNumber: string; notes: string;
  }>): Promise<any> {
    return api.put<any>(`/users/${userId}/vaccinations/${vaccinationId}`, data);
  }

  static async deleteVaccination(userId: string, vaccinationId: string): Promise<void> {
    await api.delete(`/users/${userId}/vaccinations/${vaccinationId}`);
  }

  // ─── Appointments ────────────────────────────────────────────────────────

  static async getAppointments(userId: string): Promise<any[]> {
    return api.get<any[]>(`/users/${userId}/appointments`);
  }

  static async addAppointment(userId: string, data: {
    title: string; subtitle?: string; eventDate: string;
    doctor?: string; location?: string; notes?: string;
  }): Promise<any> {
    return api.post<any>(`/users/${userId}/appointments`, data);
  }

  static async updateAppointment(userId: string, appointmentId: string, data: Partial<{
    title: string; subtitle: string; eventDate: string;
    doctor: string; location: string; notes: string;
  }>): Promise<any> {
    return api.put<any>(`/users/${userId}/appointments/${appointmentId}`, data);
  }

  static async deleteAppointment(userId: string, appointmentId: string): Promise<void> {
    await api.delete(`/users/${userId}/appointments/${appointmentId}`);
  }

  // ─── Device data ─────────────────────────────────────────────────────────

  static async getDeviceData(userId: string, deviceType?: string): Promise<any[]> {
    const path = deviceType
      ? `/users/${userId}/device-data?device_type=${deviceType}`
      : `/users/${userId}/device-data`;
    return api.get<any[]>(path);
  }

  static async ingestDeviceData(userId: string, data: {
    deviceType: string; deviceName: string; metrics: Record<string, any>; timestamp: string;
  }): Promise<any> {
    return api.post<any>(`/users/${userId}/device-data`, data);
  }

  // ─── Push token ──────────────────────────────────────────────────────────

  static async updatePushToken(userId: string, expoPushToken: string): Promise<void> {
    await api.put<any>(`/users/${userId}`, { expoPushToken });
  }

  static async recordConsent(userId: string, version: string, purposes: string[]): Promise<void> {
    await api.post(`/users/${userId}/consent`, { version, purposes });
  }

  static async withdrawConsent(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/consent`);
  }

  static async getHealthMemory(userId: string): Promise<{ memory: string | null; updatedAt: string | null }> {
    return api.get(`/users/${userId}/health-memory`);
  }

  static async exportUserData(userId: string): Promise<any> {
    return api.get(`/users/${userId}/data-export`);
  }

  static async clearHealthMemory(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/health-memory`);
  }

  // ─── Health alerts ────────────────────────────────────────────────────────

  static async getAlerts(userId: string): Promise<Array<{
    id: string;
    type: 'trend' | 'abnormal' | 'pattern';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    body: string;
    biomarkers: string[];
    created_at: string;
  }>> {
    return api.get(`/users/${userId}/alerts`);
  }

  static async dismissAlert(userId: string, alertId: string): Promise<void> {
    await api.put<any>(`/users/${userId}/alerts/${alertId}/dismiss`, {});
  }

  // ─── Biomarkers per lab result ───────────────────────────────────────────

  static async getBiomarkersForLabResult(labResultId: string): Promise<Biomarker[]> {
    const rows = await api.get<any[]>(`/biomarkers?lab_result_id=${encodeURIComponent(labResultId)}`);
    return rows.map(rowToBiomarker);
  }

  // ─── Device OAuth ─────────────────────────────────────────────────────────

  static async getDeviceAuthUrl(userId: string, device: 'whoop' | 'oura'): Promise<{ authUrl: string; redirectUri: string }> {
    return api.get(`/users/${userId}/device-oauth/auth-url/${device}`);
  }

  static async exchangeDeviceCode(userId: string, device: 'whoop' | 'oura', code: string, redirectUri: string): Promise<void> {
    await api.post(`/users/${userId}/device-oauth/${device}`, { code, redirectUri });
  }

  static async getDeviceConnectionStatus(userId: string): Promise<Array<{ device_type: string; device_name: string; last_sync: string }>> {
    return api.get(`/users/${userId}/device-oauth/status`);
  }

  // ─── AI insights (server-side — OpenAI key never leaves backend) ────────────

  static async getDailyInsights(): Promise<Array<{
    id: string; title: string; description: string;
    category: string; priority: string; actionable: boolean; action?: string | null;
  }>> {
    const result = await api.post<{ insights: any[] }>('/ai/insights', {});
    return result.insights ?? [];
  }

  // ─── AI chat ─────────────────────────────────────────────────────────────

  static async sendChatMessage(message: string): Promise<{ reply: string }> {
    return api.post<{ reply: string }>('/ai/chat', { message });
  }

  static async getChatHistory(): Promise<Array<{ role: string; content: string; created_at: string }>> {
    return api.get('/ai/history');
  }

  static async getImagingResults(): Promise<Array<{
    id: string; modality: string; body_part: string | null; study_date: string | null;
    facility: string | null; radiologist: string | null; findings: string | null;
    impression: string | null; measurements: Record<string, number> | null; notes: string | null;
  }>> {
    return api.get('/ai/imaging-results');
  }

  static async transcribeAudio(audioBase64: string, mimeType: string): Promise<{ transcript: string }> {
    return api.post<{ transcript: string }>('/ai/transcribe', { audio: audioBase64, mimeType });
  }

  static async analyzeImage(imageBase64: string, mimeType: string, prompt?: string): Promise<{ analysis: string }> {
    return api.post<{ analysis: string }>('/ai/analyze-image', { image: imageBase64, mimeType, prompt });
  }
}
