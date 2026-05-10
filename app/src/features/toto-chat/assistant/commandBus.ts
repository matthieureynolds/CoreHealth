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
  return http('/api/timeline', { ...entry, occurredAt });
}

async function recommendVitC(payload: SupplementAdviceInput): Promise<SupplementAdviceResult> {
  return http<SupplementAdviceResult>('/api/supplements/advice', payload);
}

async function rescheduleDentist(payload: AppointmentRescheduleInput): Promise<AppointmentRescheduleResult> {
  if (!payload.appointmentId && !payload.providerName) {
    throw new Error('appointmentId or providerName required');
  }
  const id = payload.appointmentId || 'provider';
  return http<AppointmentRescheduleResult>(`/api/appointments/${encodeURIComponent(id)}/reschedule`, payload);
}

async function logLegPain(payload: SymptomLegPainInput): Promise<{ symptomId: string; plan: SymptomPlan }> {
  return http('/api/symptoms/leg', payload);
}

async function updatePeanutAllergy(payload: AllergyUpdateInput): Promise<{ allergyId: string; status: string }> {
  return http('/api/allergies', payload);
}

async function addCountryCard(payload: CountryCardInput): Promise<{ cardId: string }> {
  return http('/api/travel/country-card', payload);
}

async function submitLabResults(payload: LabSubmitInput): Promise<LabSubmitResult> {
  return http<LabSubmitResult>('/api/labs/submit', payload);
}

async function changeTripDates(payload: TravelChangeInput): Promise<TravelChangeResult> {
  const id = payload.tripId || 'by-destination';
  return http<TravelChangeResult>(`/api/travel/trips/${encodeURIComponent(id)}/change`, payload);
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
  return http('/api/toggles', { toggleKey: args.toggleKey, completed: !!args.completed, symptomId: args.symptomId });
}


