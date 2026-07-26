/**
 * Jet-lag plan endpoint (pure compute — no DB).
 *
 * POST /jetlag/plan
 * body: {
 *   origin_iata, dest_iata, origin_tz, dest_tz, dep_local, arr_local,
 *   departureDate, returnDate?, variant?,            // 'outbound' | 'return'
 *   sleep: { start, end },                           // habitual sleep window 'HH:MM'
 *   prefs: { chronotype, planStyle, caffeine, melatonin, naps },
 *   wearable?: { measuredSleep?, hrNadirLocal?, glucoseNadirLocal? },
 *   age?, lightSensitivity?, priorAdaptationHours?,
 *   layovers?, commitments?
 * }
 * → { plan: PlanDay[], summary, achievedAdaptation, circadian }
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok, err, parseBody } from '../_shared/response';
import { requireAuth } from '../_shared/auth';
import {
  EngineTrip, generatePlan, getPlanSummary, getAchievedAdaptation,
  estimateCircadianPhase, computeAdaptationFactor, tzDiffHours,
} from './engine';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireAuth(event);
  if ('statusCode' in auth) return auth;

  const body = parseBody(event.body);
  if (!body) return err(400, 'Invalid request body');

  const { origin_tz, dest_tz, dep_local, arr_local, departureDate } = body;
  if (!origin_tz || !dest_tz || !dep_local || !arr_local || !departureDate) {
    return err(400, 'origin_tz, dest_tz, dep_local, arr_local, departureDate required');
  }
  const sleep = body.sleep && body.sleep.start && body.sleep.end ? body.sleep : { start: '23:00', end: '07:00' };
  const prefs = {
    sleep_window_local: sleep,
    chronotype: body.prefs?.chronotype ?? 'neutral',
    caffeine: body.prefs?.caffeine ?? true,
    melatonin: body.prefs?.melatonin ?? false,
    naps: body.prefs?.naps ?? false,
  };

  const circadian = estimateCircadianPhase({
    settingsSleep: sleep,
    measuredSleep: body.wearable?.measuredSleep ?? null,
    hrNadirLocal: body.wearable?.hrNadirLocal ?? null,
    glucoseNadirLocal: body.wearable?.glucoseNadirLocal ?? null,
  });
  const adaptationFactor = computeAdaptationFactor({
    age: body.age,
    measuredSleep: body.wearable?.measuredSleep ?? null,
    lightSensitivity: body.lightSensitivity,
  });

  let stayDays: number | undefined;
  if (body.returnDate) {
    const ms = new Date(body.returnDate).getTime() - new Date(departureDate).getTime();
    if (!isNaN(ms)) stayDays = Math.max(0, Math.round(ms / 86_400_000));
  }

  const trip: EngineTrip = {
    id: String(body.id ?? 'plan'),
    origin_iata: body.origin_iata ?? 'ORIG',
    dest_iata: body.dest_iata ?? 'DEST',
    dep_local, arr_local,
    origin_tz, dest_tz,
    tz_diff_hours: tzDiffHours(origin_tz, dest_tz, new Date(departureDate)),
    plan_style: prefs ? (body.prefs?.planStyle ?? 'gentle') : 'gentle',
    prefs: { ...prefs, sleep_window_local: circadian.sleep },
    cbt_min_local: circadian.cbtMin,
    adaptation_factor: adaptationFactor,
    advance_efficiency: typeof body.advanceEfficiency === 'number' ? body.advanceEfficiency : undefined,
    delay_efficiency: typeof body.delayEfficiency === 'number' ? body.delayEfficiency : undefined,
    measured_now: body.measuredNow && typeof body.measuredNow.day_offset === 'number' && body.measuredNow.cbt_min_local
      ? body.measuredNow : undefined,
    stay_days: body.variant === 'return' ? undefined : stayDays,
    prior_adaptation_hours: typeof body.priorAdaptationHours === 'number' ? body.priorAdaptationHours : undefined,
    layovers: Array.isArray(body.layovers) ? body.layovers : undefined,
    commitments: Array.isArray(body.commitments) ? body.commitments : undefined,
  };

  try {
    return ok({
      plan: generatePlan(trip),
      summary: getPlanSummary(trip),
      achievedAdaptation: getAchievedAdaptation(trip),
      circadian: { cbtMin: circadian.cbtMin, source: circadian.source, confidence: circadian.confidence },
    });
  } catch (e) {
    console.error('[jetlag] plan generation failed', e);
    return err(500, 'Failed to generate plan');
  }
};
