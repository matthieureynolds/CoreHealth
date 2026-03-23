import type { Command } from './commandBus';

// Detects a JSON command block either in a fenced code block or inline JSON
export function parseAssistantCommand(text: string): Command | null {
  try {
    if (!text) return null;

    // Extract the last JSON code fence if present
    const fenceRegex = /```json\s*([\s\S]*?)```/gi;
    let lastMatch: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    while ((m = fenceRegex.exec(text)) !== null) {
      lastMatch = m;
    }

    const candidate = lastMatch ? lastMatch[1] : text;
    // Find first JSON object in candidate
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    const jsonStr = candidate.slice(firstBrace, lastBrace + 1);

    const obj = JSON.parse(jsonStr);
    // Accept keys: type or command
    const type: string | undefined = obj.type || obj.command;
    if (!type) return null;

    switch (type) {
      case 'SUPPLEMENT_VITC_RECOMMEND':
      case 'APPT_RESCHEDULE_DENTIST':
      case 'SYMPTOM_LOG_LEG_PAIN':
      case 'ALLERGY_UPDATE_PNUT':
      case 'TRAVEL_ADD_COUNTRY_CARD':
      case 'LAB_SUBMIT_RESULTS':
      case 'TRIP_CHANGE_DATES':
        return { type, payload: obj.payload } as Command;
      default:
        return null;
    }
  } catch {
    return null;
  }
}


