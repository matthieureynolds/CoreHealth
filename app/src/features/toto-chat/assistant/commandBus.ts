import { API_CONFIG } from '../../../shared/config/api';
import type {
  SupplementAdviceInput,
  SupplementAdviceResult,
  AppointmentRescheduleInput,
  AppointmentRescheduleResult,
  SymptomLegPainInput,
  SymptomPlan,
  AllergyUpdateInput,
  CountryCardInput,
  LabSubmitInput,
  LabSubmitResult,
  TravelChangeInput,
  TravelChangeResult,
} from './slots';
import { supabase } from '../../../shared/config/supabase';

export type Command =
  | { type: 'SUPPLEMENT_VITC_RECOMMEND'; payload: SupplementAdviceInput }
  | { type: 'APPT_RESCHEDULE_DENTIST'; payload: AppointmentRescheduleInput }
  | { type: 'SYMPTOM_LOG_LEG_PAIN'; payload: SymptomLegPainInput }
  | { type: 'ALLERGY_UPDATE_PNUT'; payload: AllergyUpdateInput }
  | { type: 'TRAVEL_ADD_COUNTRY_CARD'; payload: CountryCardInput }
  | { type: 'LAB_SUBMIT_RESULTS'; payload: LabSubmitInput }
  | { type: 'TRIP_CHANGE_DATES'; payload: TravelChangeInput };

async function http<T>(path: string, body: any, method: 'POST'|'PUT' = 'POST'): Promise<T> {
  const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function postTimeline(entry: { type: string; title: string; description?: string; occurredAt?: string; meta?: Record<string, any> }) {
  const occurredAt = entry.occurredAt || new Date().toISOString();
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http('/api/timeline', { ...entry, occurredAt });
  const { data, error } = await supabase.rpc('timeline_insert', { entry: { ...entry, occurredAt } as any });
  if (error) throw error;
  return data as any;
}

async function recommendVitC(payload: SupplementAdviceInput): Promise<SupplementAdviceResult> {
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http<SupplementAdviceResult>('/api/supplements/advice', payload);
  const { data, error } = await supabase.rpc('supplement_vitc_advice', { payload });
  if (error) throw error;
  return data as any;
}

async function rescheduleDentist(payload: AppointmentRescheduleInput): Promise<AppointmentRescheduleResult> {
  if (!payload.appointmentId && !payload.providerName) {
    throw new Error('appointmentId or providerName required');
  }
  const id = payload.appointmentId || 'provider';
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http<AppointmentRescheduleResult>(`/api/appointments/${encodeURIComponent(id)}/reschedule`, payload);
  const { data, error } = await supabase.rpc('appointment_reschedule', { id, payload });
  if (error) throw error;
  return data as any;
}

async function logLegPain(payload: SymptomLegPainInput): Promise<{ symptomId: string; plan: SymptomPlan }> {
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http('/api/symptoms/leg', payload);
  const { data, error } = await supabase.rpc('symptom_leg_pain', { payload });
  if (error) throw error;
  return data as any;
}

async function updatePeanutAllergy(payload: AllergyUpdateInput): Promise<{ allergyId: string; status: string }> {
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http('/api/allergies', payload);
  const { data, error } = await supabase.rpc('allergy_update_peanut', { payload });
  if (error) throw error;
  return data as any;
}

async function addCountryCard(payload: CountryCardInput): Promise<{ cardId: string }> {
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http('/api/travel/country-card', payload);
  const { data, error } = await supabase.rpc('travel_add_country_card', { payload });
  if (error) throw error;
  return data as any;
}

async function submitLabResults(payload: LabSubmitInput): Promise<LabSubmitResult> {
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http<LabSubmitResult>('/api/labs/submit', payload);
  const { data, error } = await supabase.rpc('labs_submit', { payload });
  if (error) throw error;
  return data as any;
}

async function changeTripDates(payload: TravelChangeInput): Promise<TravelChangeResult> {
  const id = payload.tripId || 'by-destination';
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) return http<TravelChangeResult>(`/api/travel/trips/${encodeURIComponent(id)}/change`, payload);
  const { data, error } = await supabase.rpc('travel_change_dates', { id, payload });
  if (error) throw error;
  return data as any;
}

export async function dispatch(cmd: Command) {
  switch (cmd.type) {
    case 'SUPPLEMENT_VITC_RECOMMEND': return recommendVitC(cmd.payload);
    case 'APPT_RESCHEDULE_DENTIST': return rescheduleDentist(cmd.payload);
    case 'SYMPTOM_LOG_LEG_PAIN': return logLegPain(cmd.payload);
    case 'ALLERGY_UPDATE_PNUT': return updatePeanutAllergy(cmd.payload);
    case 'TRAVEL_ADD_COUNTRY_CARD': return addCountryCard(cmd.payload);
    case 'LAB_SUBMIT_RESULTS': return submitLabResults(cmd.payload);
    case 'TRIP_CHANGE_DATES': return changeTripDates(cmd.payload);
  }
}

export { postTimeline };

export async function togglesMark(args: { toggleKey: string; completed: boolean; symptomId?: string }) {
  const hasApi = !!process.env.EXPO_PUBLIC_API_BASE_URL;
  if (hasApi) {
    return http('/api/toggles', { toggleKey: args.toggleKey, completed: !!args.completed, symptomId: args.symptomId });
  }
  const { data, error } = await supabase.rpc('toggles_mark', {
    toggle_key: args.toggleKey,
    completed: args.completed,
    symptom_id: args.symptomId || null,
  });
  if (error) throw error;
  return data as any;
}


