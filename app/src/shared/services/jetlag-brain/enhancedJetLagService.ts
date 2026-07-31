import {
  Trip,
  PlanDay,
  Action,
  NowCard,
  FlightLookupResult,
} from "../../types";
import { findMockFlight } from "../../../features/travel/mockFlights";

/**
 * Enhanced Jet Lag Service
 * Implements PRC-based circadian rhythm optimization
 * Following the comprehensive plan specification
 */

interface ShiftStrategy {
  /**
   * Which way the body clock is being turned (may differ from geography for big
   * east jumps). 'anchor' = stay on home time for a short trip (don't re-entrain).
   */
  direction: "advance" | "delay" | "anchor";
  /** Total hours of phase shift required in the chosen direction. */
  totalShiftHours: number;
  /** Hours shifted per day (advance ~1, delay ~1.5; faster in aggressive mode). */
  dailyShiftHours: number;
  preDays: number;
  postDays: number;
  homeSleep: { start: string; end: string };
  cbtMinHome: string;
  /** Origin→dest tz difference normalised to (-12,+12], east positive. */
  tzDiffNormalized: number;
  /**
   * full   = shift all the way to local time (long stays / one-way)
   * partial= shift just enough that CBTmin falls in the sleep window (Eastman's
   *          "partial adaptation" — the functional goal for medium stays)
   * anchor = stay on home time (very short stays)
   * minimal= shift is small/none, body copes on its own
   */
  mode: "full" | "partial" | "anchor" | "minimal";
  /** Closed-loop anchor: from `fromDay`, progress continues from the measured shift. */
  adaptive?: { fromDay: number; achievedActual: number };
}

/**
 * Generate a personalized, day-by-day circadian shift plan
 */
export class EnhancedJetLagService {
  /**
   * Generate plan for a trip
   */
  static generatePlan(trip: Trip): PlanDay[] {
    const strat = this.computeStrategy(trip);
    const planDays: PlanDay[] = [];

    // Only show as many pre-adaptation days as there actually are before the flight,
    // so a trip booked the night before doesn't display prep days that are in the past.
    const preDays = Math.max(
      0,
      Math.min(strat.preDays, this.daysUntil(trip.dep_local)),
    );

    for (let off = -preDays; off <= strat.postDays; off++) {
      const segment: "pre" | "in_flight" | "post" =
        off < 0 ? "pre" : off === 0 ? "in_flight" : "post";

      // Cumulative body-clock shift achieved by this day. Re-entrainment is not
      // linear — the final approach to alignment is slower — so we taper. When we
      // have a real mid-trip measurement, days from then on continue from where the
      // clock ACTUALLY is, not where the open-loop projection assumed it would be.
      let magnitude: number;
      if (strat.adaptive && off >= strat.adaptive.fromDay) {
        magnitude = this.projectShiftFrom(
          strat.adaptive.achievedActual,
          off - strat.adaptive.fromDay,
          strat.totalShiftHours,
          strat.dailyShiftHours,
        );
      } else {
        magnitude = this.achievedShift(
          off + preDays,
          strat.totalShiftHours,
          strat.dailyShiftHours,
        );
      }
      const signedShift =
        strat.direction === "advance" ? magnitude : -magnitude;

      planDays.push(this.createPlanDay(trip, off, segment, strat, signedShift));
    }

    return planDays;
  }

  /**
   * Hours the body will have adapted by the time the traveller flies home — i.e.
   * how much the RETURN leg needs to undo. 0 for an anchored (home-time) outbound.
   */
  static getAchievedAdaptation(trip: Trip): number {
    const s = this.computeStrategy(trip);
    if (s.totalShiftHours === 0) return 0;
    const daysOfShifting = s.preDays + (trip.stay_days ?? 30);
    return (
      Math.round(
        this.achievedShift(
          daysOfShifting,
          s.totalShiftHours,
          s.dailyShiftHours,
        ) * 10,
      ) / 10
    );
  }

  /**
   * From a mid-trip measurement, the observed vs expected daily shift rate — the
   * signal used to learn this user's per-direction efficiency. Null if no usable
   * measurement (no measured_now, anchored, or zero elapsed days).
   */
  static getObservedShiftRate(trip: Trip): {
    direction: "advance" | "delay";
    observedPerDay: number;
    expectedPerDay: number;
  } | null {
    if (!trip.measured_now) return null;
    const s = this.computeStrategy(trip);
    if (!s.adaptive || s.direction === "anchor" || s.totalShiftHours === 0)
      return null;
    const daysElapsed = Math.max(1, trip.measured_now.day_offset);
    return {
      direction: s.direction,
      observedPerDay: s.adaptive.achievedActual / daysElapsed,
      expectedPerDay: s.dailyShiftHours,
    };
  }

  /** A short, human explanation of the chosen strategy (for the UI header). */
  static getPlanSummary(trip: Trip): {
    mode: ShiftStrategy["mode"];
    label: string;
    detail: string;
  } {
    const s = this.computeStrategy(trip);
    const h = Math.round(s.totalShiftHours);
    switch (s.mode) {
      case "anchor":
        return {
          mode: s.mode,
          label: "Stay on home time",
          detail:
            "Short trip — adapting then reversing isn't worth it, so keep your home routine.",
        };
      case "partial":
        return {
          mode: s.mode,
          label: "Partial shift",
          detail: `Medium stay — shift ~${h}h, just enough to sleep well rather than fully onto local time.`,
        };
      case "minimal":
        return {
          mode: s.mode,
          label: "Minimal shift needed",
          detail: "Small time change — your body will adjust on its own.",
        };
      default:
        return {
          mode: s.mode,
          label: "Full adjustment",
          detail: `Shift ${h}h fully onto local time, about ${s.dailyShiftHours}h per day.`,
        };
    }
  }

  /**
   * Cumulative shift (hours) achieved after `days` of shifting, with diminishing
   * returns near the target — the last ~30% of the shift comes ~40% slower, which
   * is closer to observed re-entrainment than a straight line.
   */
  private static achievedShift(
    days: number,
    total: number,
    rate: number,
  ): number {
    if (total <= 0 || rate <= 0 || days <= 0) return 0;
    let done = 0;
    for (let d = 0; d < days && done < total; d++) {
      const slow = done >= 0.7 * total ? 0.6 : 1;
      done = Math.min(total, done + rate * slow);
    }
    return done;
  }

  /** Days required to (nearly) complete a shift under the tapered model. */
  private static daysToShift(total: number, rate: number): number {
    return this.daysToShiftFrom(0, total, rate);
  }

  /** Continue the tapered accumulation from an already-achieved shift. */
  private static projectShiftFrom(
    start: number,
    days: number,
    total: number,
    rate: number,
  ): number {
    if (total <= 0 || rate <= 0) return Math.min(start, Math.max(0, total));
    let done = Math.max(0, Math.min(start, total));
    for (let d = 0; d < days && done < total; d++) {
      done = Math.min(total, done + rate * (done >= 0.7 * total ? 0.6 : 1));
    }
    return done;
  }

  /** Days to (nearly) finish the shift starting from `start` hours already done. */
  private static daysToShiftFrom(
    start: number,
    total: number,
    rate: number,
  ): number {
    if (total <= 0 || rate <= 0) return 0;
    let done = Math.max(0, Math.min(start, total));
    let d = 0;
    while (done < total - 0.05 && d < 30) {
      done = Math.min(total, done + rate * (done >= 0.7 * total ? 0.6 : 1));
      d++;
    }
    return d;
  }

  /**
   * Infer how far the body has ACTUALLY shifted from a measured CBTmin partway
   * through the trip. Phase model: measuredCbtLocal = cbtMinHome + tzOffset − signed,
   * so signed = cbtMinHome + tzOffset − measured (normalised to ±12h), then converted
   * to a magnitude in the chosen direction and clamped to [0, total].
   */
  private static inferAchievedShift(
    direction: "advance" | "delay" | "anchor",
    cbtMinHome: string,
    tzDiffNormalized: number,
    total: number,
    measured: { day_offset: number; cbt_min_local: string },
  ): number {
    const atDestination = measured.day_offset >= 0;
    const offsetH = atDestination ? tzDiffNormalized : 0;
    let signed =
      (this.timeToMinutes(cbtMinHome) +
        offsetH * 60 -
        this.timeToMinutes(measured.cbt_min_local)) /
      60;
    // Normalise to the nearest equivalent in (-12, 12].
    signed = ((((signed + 12) % 24) + 24) % 24) - 12;
    const magnitude = direction === "advance" ? signed : -signed;
    return Math.max(0, Math.min(total, magnitude));
  }

  /** Whole days from today (local) until departure; 0 if today or past. */
  private static daysUntil(depLocalIso: string): number {
    const now = new Date();
    const dep = new Date(depLocalIso);
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const depUtc = Date.UTC(dep.getFullYear(), dep.getMonth(), dep.getDate());
    return Math.floor((depUtc - todayUtc) / 86_400_000);
  }

  /**
   * The heart of the engine: decide WHICH WAY to turn the body clock and how fast.
   *
   * Humans phase-delay (~1.5 h/day) more easily than they phase-advance (~1 h/day)
   * because our free-running period is ~24.2 h. So for each trip we compare the days
   * required to re-entrain by advancing vs delaying and pick the faster route. This
   * is why a big eastward jump (e.g. ~10–12 h, Australia → US west coast) is best
   * handled by DELAYING the long way round rather than fighting an advance.
   */
  private static computeStrategy(trip: Trip): ShiftStrategy {
    const style = trip.plan_style;
    const home = trip.prefs.sleep_window_local;

    // Normalise the timezone difference to (-12, +12], east positive.
    let d = trip.tz_diff_hours % 24;
    if (d > 12) d -= 24;
    if (d <= -12) d += 24;

    const advanceMag = d >= 0 ? d : 24 + d; // hours the clock must move earlier
    const delayMag = d >= 0 ? 24 - d : -d; // hours the clock must move later
    // Individual variability: older / less light-sensitive travellers shift slower.
    const factor = trip.adaptation_factor ?? 1;
    // Learned per-direction efficiency personalises both the rate AND the advance-vs-
    // delay crossover (a poor advancer flips to delay sooner).
    const advanceRate =
      (style === "aggressive" ? 1.5 : 1.0) *
      factor *
      (trip.advance_efficiency ?? 1);
    const delayRate =
      (style === "aggressive" ? 2.0 : 1.5) *
      factor *
      (trip.delay_efficiency ?? 1);

    let direction: "advance" | "delay" | "anchor";
    let totalShiftHours: number;
    let dailyShiftHours: number;

    if (advanceMag === 0) {
      direction = "advance";
      totalShiftHours = 0;
      dailyShiftHours = advanceRate;
    } else if (advanceMag / advanceRate <= delayMag / delayRate) {
      direction = "advance";
      totalShiftHours = advanceMag;
      dailyShiftHours = advanceRate;
    } else {
      direction = "delay";
      totalShiftHours = delayMag;
      dailyShiftHours = delayRate;
    }

    // Prefer a personalised CBTmin (from wearable sleep + HR) when available;
    // otherwise fall back to the population estimate of ~2 h before habitual wake.
    const cbtMinHome =
      trip.cbt_min_local ?? this.subtractMinutes(home.end, 120);

    // Return leg: only undo the adaptation actually achieved outbound (you may have
    // only partially adapted, or anchored on home time and not adapted at all).
    const fullShift =
      trip.prior_adaptation_hours !== undefined
        ? Math.min(totalShiftHours, trip.prior_adaptation_hours)
        : totalShiftHours;

    // Short trip with a meaningful shift → don't re-entrain at all. Adapting takes
    // days and you'd only have to reverse it on the way home, so the smart move is
    // to stay anchored to home time (Lockley's advice for stays of ≲3 days).
    const ANCHOR_MAX_STAY = 3;
    if (
      trip.stay_days !== undefined &&
      trip.stay_days <= ANCHOR_MAX_STAY &&
      fullShift >= 3
    ) {
      return {
        direction: "anchor",
        totalShiftHours: 0,
        dailyShiftHours: 0,
        preDays: 0,
        postDays: Math.max(1, Math.min(trip.stay_days, 6)),
        homeSleep: home,
        cbtMinHome,
        tzDiffNormalized: d,
        mode: "anchor",
      };
    }

    // Partial adaptation (Eastman/Lockley): for a medium stay you can't fully adapt
    // before flying home, so aim only to get CBTmin into the sleep window — that's
    // what restores good sleep & performance, with far less to shift and reverse.
    const partialShift = Math.min(
      fullShift,
      this.minShiftToWindow(
        this.addMinutes(cbtMinHome, d * 60),
        home,
        direction,
      ),
    );
    const daysForFull = Math.ceil(fullShift / dailyShiftHours);
    const usedPartial =
      trip.stay_days !== undefined &&
      trip.stay_days < daysForFull &&
      partialShift < fullShift;
    totalShiftHours = usedPartial ? partialShift : fullShift;

    let mode: ShiftStrategy["mode"];
    if (fullShift < 3) mode = "minimal";
    else if (usedPartial) mode = "partial";
    else mode = "full";

    const daysNeeded =
      totalShiftHours > 0
        ? this.daysToShift(totalShiftHours, dailyShiftHours)
        : 0;
    // Pre-adapting at home helps eastward (advance) trips the most.
    const preDays =
      totalShiftHours === 0
        ? 0
        : Math.min(direction === "advance" ? 3 : 2, daysNeeded);
    let postDays =
      totalShiftHours === 0 ? 1 : Math.min(Math.max(daysNeeded, 1), 6);

    // Closed-loop: if we have a real measured phase mid-trip, infer how far the body
    // ACTUALLY shifted and continue from there — extending the horizon if behind.
    let adaptive: ShiftStrategy["adaptive"];
    if (trip.measured_now && totalShiftHours > 0) {
      const achievedActual = this.inferAchievedShift(
        direction,
        cbtMinHome,
        d,
        totalShiftHours,
        trip.measured_now,
      );
      adaptive = { fromDay: trip.measured_now.day_offset, achievedActual };
      const remaining = this.daysToShiftFrom(
        achievedActual,
        totalShiftHours,
        dailyShiftHours,
      );
      postDays = Math.min(
        8,
        Math.max(postDays, trip.measured_now.day_offset + remaining),
      );
    }

    return {
      direction,
      totalShiftHours,
      dailyShiftHours,
      preDays,
      postDays,
      homeSleep: home,
      // CBTmin (core-body-temperature minimum) ≈ 2 h before habitual wake — the
      // pivot of the light phase-response curve that every window below anchors to.
      cbtMinHome,
      tzDiffNormalized: d,
      mode,
      adaptive,
    };
  }

  /**
   * Minimum shift (hours) needed to bring CBTmin into the sleep window, moving in
   * the chosen direction. 0 if CBTmin already falls within sleep on arrival.
   */
  private static minShiftToWindow(
    arrivalCbtLocal: string,
    sleep: { start: string; end: string },
    direction: "advance" | "delay",
  ): number {
    const bed = this.timeToMinutes(sleep.start);
    const wake = this.timeToMinutes(sleep.end);
    const inWindow = (m: number): boolean => {
      const x = ((m % 1440) + 1440) % 1440;
      return bed <= wake ? x >= bed && x <= wake : x >= bed || x <= wake;
    };
    let m = this.timeToMinutes(arrivalCbtLocal);
    if (inWindow(m)) return 0;
    const step = direction === "advance" ? -1 : 1;
    for (let dist = 1; dist <= 1440; dist++) {
      m += step;
      if (inWindow(m)) return dist / 60;
    }
    return 0;
  }

  /**
   * Generate NowCard for current time
   */
  static generateNowCard(trip: Trip, planDays: PlanDay[]): NowCard {
    const now = new Date();
    const currentTz = this.getCurrentTimezone(trip, now);
    const currentTime = this.formatTime(now, currentTz);

    // Find current plan day
    const currentPlanDay = this.findCurrentPlanDay(planDays, now, currentTz);

    if (!currentPlanDay) {
      return {
        trip_id: trip.id,
        generated_at_local: now.toISOString(),
        current_location_tz: currentTz,
        current_action: null,
        next_action_preview: undefined,
      };
    }

    // Find current action
    const currentAction = this.findCurrentAction(
      currentPlanDay.actions,
      currentTime,
    );
    const nextAction = this.findNextAction(currentPlanDay.actions, currentTime);

    return {
      trip_id: trip.id,
      generated_at_local: now.toISOString(),
      current_location_tz: currentTz,
      current_action: currentAction
        ? {
            label: this.getActionLabel(currentAction),
            window: {
              start_local:
                currentAction.start_local || currentAction.at_local || "",
              end_local:
                currentAction.end_local || currentAction.at_local || "",
            },
            explain:
              currentAction.rationale ||
              this.getDefaultExplanation(currentAction),
            cta: "Done",
          }
        : null,
      next_action_preview: nextAction
        ? `Next: ${this.getActionLabel(nextAction)} ${nextAction.start_local || nextAction.at_local}`
        : undefined,
    };
  }

  /**
   * Create a plan day with actions, all anchored to that day's shifted sleep window.
   */
  private static createPlanDay(
    trip: Trip,
    dayOffset: number,
    segment: "pre" | "in_flight" | "post",
    strat: ShiftStrategy,
    signedShift: number,
  ): PlanDay {
    const date = this.getPlanDayDate(trip, dayOffset);
    const location = this.getPlanDayLocation(trip, dayOffset, segment);
    const prefs = trip.prefs;

    const actions: Action[] = [];

    // Everything is anchored to the LOCAL time of wherever the traveller physically
    // is that day (Lockley's key point: time light to the body clock, not the wall
    // clock). Pre-flight days are in origin-local time; the travel day and after are
    // in destination-local time. localOffset converts the home schedule into that
    // local frame: + destination tz once travelling, − the shift already achieved.
    const isAnchor = strat.direction === "anchor";
    // In anchor mode the body never re-entrains, so its phase stays on home time;
    // we just express that home schedule in the destination's clock.
    const atDestination = segment !== "pre";
    const localOffsetMin =
      (atDestination ? strat.tzDiffNormalized * 60 : 0) - signedShift * 60;

    // That day's target sleep window, in the current location's clock time.
    const sleep = this.shiftWindowMin(strat.homeSleep, localOffsetMin);
    // CBTmin in the current location's clock time — the pivot for all light timing.
    const cbtMinLocal = this.addMinutes(strat.cbtMinHome, localOffsetMin);

    const shiftedBy = `${Math.abs(signedShift).toFixed(1)}h ${strat.direction === "advance" ? "earlier" : "later"}`;
    actions.push({
      type: "sleep",
      start_local: sleep.start,
      end_local: sleep.end,
      at_local: null,
      rationale: isAnchor
        ? "Short trip — stay on home time. Keep your usual sleep (shown in local clock) so you don’t adapt twice."
        : signedShift === 0
          ? "Sleep on your normal schedule"
          : `Target sleep (local time) — body clock now ${shiftedBy} than home`,
    });

    // In-flight block for the travel day.
    if (segment === "in_flight") {
      const depTime = this.formatTime(new Date(trip.dep_local), trip.origin_tz);
      const arrTime = this.formatTime(new Date(trip.arr_local), trip.dest_tz);
      actions.push({
        type: "in_flight",
        start_local: depTime,
        end_local: arrTime,
        at_local: null,
        rationale: isAnchor
          ? "Stay on home time — try to sleep on the plane only during your home night."
          : strat.direction === "advance"
            ? "Set your watch to destination time. Block light early in the flight and seek it later to advance your clock."
            : "Set your watch to destination time. Seek light late in the flight and block it early to delay your clock.",
      });
      // Long layovers in a third timezone are a real chance to sleep or get light.
      actions.push(...this.layoverActions(trip, strat.direction));
    }

    // Timed light — the most powerful lever. Windows are placed around the body
    // clock's CBTmin in local time, so on arrival days they correctly tell you to
    // BLOCK light that falls on the wrong side of your (not-yet-adjusted) clock.
    // (No phase-shifting light in anchor mode — totalShiftHours is 0.)
    actions.push(
      ...this.lightActions(cbtMinLocal, strat.direction, strat.totalShiftHours),
    );

    // Melatonin: advances the clock (PRC) on advance trips; in anchor mode it just
    // helps you fall asleep at your home bedtime when it lands at an odd local hour.
    if (
      prefs.melatonin &&
      ((strat.direction === "advance" && strat.totalShiftHours > 0) || isAnchor)
    ) {
      actions.push({
        type: "melatonin",
        start_local: null,
        end_local: null,
        at_local: this.subtractMinutes(sleep.start, 180),
        intensity: "low",
        rationale: isAnchor
          ? "0.5–3 mg ~3 h before your (home) bedtime to lock in sleep at the off-hour local time"
          : "0.5–3 mg ~3 h before target bedtime to advance your clock (melatonin PRC)",
      });
    }

    // Caffeine as a wakefulness countermeasure (Beaumont 2004), never a phase-shifter.
    if (prefs.caffeine) {
      actions.push(...this.caffeineActions(sleep, segment));
    }

    // Meals are a secondary zeitgeber for peripheral clocks.
    actions.push(this.mealAction(sleep, segment, isAnchor));

    // Optional short nap to manage sleep pressure on hard post-arrival (advance) days.
    if (
      prefs.naps &&
      segment === "post" &&
      strat.direction === "advance" &&
      strat.totalShiftHours > 0
    ) {
      const napStart = this.addMinutes(sleep.end, 360); // ~6 h after waking, early afternoon
      actions.push({
        type: "nap",
        start_local: napStart,
        end_local: this.addMinutes(napStart, 30),
        at_local: null,
        rationale:
          "Optional nap, max 30 min and before mid-afternoon, so it does not steal night sleep",
      });
    }

    // Fixed commitments (meetings etc.) — flag alertness risk and protect them.
    actions.push(...this.commitmentActions(trip, date, sleep, cbtMinLocal));

    // Sort actions by time
    actions.sort((a, b) => {
      const timeA = a.start_local || a.at_local || "00:00";
      const timeB = b.start_local || b.at_local || "00:00";
      return timeA.localeCompare(timeB);
    });

    return {
      id: `${trip.id}-day-${dayOffset}`,
      trip_id: trip.id,
      date_local: date,
      location,
      actions,
      notes: this.generateDayNotes(segment, signedShift),
    };
  }

  /** Shift a window by a signed number of minutes (handles wrap + negatives). */
  private static shiftWindowMin(
    window: { start: string; end: string },
    minutes: number,
  ): { start: string; end: string } {
    return {
      start: this.addMinutes(window.start, minutes),
      end: this.addMinutes(window.end, minutes),
    };
  }

  /**
   * Light exposure — the strongest zeitgeber. Placed by the light phase-response
   * curve around CBTmin *in local clock time*:
   *   • light in the ~6 h AFTER CBTmin advances the clock
   *   • light in the ~6 h BEFORE CBTmin delays it
   * Because cbtMinLocal already accounts for how far the clock has (not) adjusted,
   * the avoid window correctly covers arrival-morning light that would push the clock
   * the wrong way — exactly Lockley's "7am in Paris = 1am in New York" case.
   */
  private static lightActions(
    cbtMinLocal: string,
    direction: "advance" | "delay" | "anchor",
    totalShiftHours: number,
  ): Action[] {
    if (totalShiftHours === 0 || direction === "anchor") return [];

    if (direction === "advance") {
      return [
        {
          type: "seek_light",
          start_local: cbtMinLocal,
          end_local: this.addMinutes(cbtMinLocal, 360),
          at_local: null,
          intensity: "high",
          rationale:
            "Bright light from your body-clock low (CBTmin) through the morning — this advances your clock",
        },
        {
          type: "avoid_light",
          start_local: this.subtractMinutes(cbtMinLocal, 300),
          end_local: cbtMinLocal,
          at_local: null,
          intensity: "high",
          rationale:
            "Block light before CBTmin — incl. early arrival-morning light, which would delay you the wrong way",
        },
      ];
    }
    return [
      {
        type: "seek_light",
        start_local: this.subtractMinutes(cbtMinLocal, 360),
        end_local: cbtMinLocal,
        at_local: null,
        intensity: "high",
        rationale:
          "Bright light in the ~6 h before CBTmin (evening) — this delays your clock",
      },
      {
        type: "avoid_light",
        start_local: cbtMinLocal,
        end_local: this.addMinutes(cbtMinLocal, 300),
        at_local: null,
        intensity: "high",
        rationale:
          "Sunglasses after CBTmin (early morning) — that light would advance you the wrong way",
      },
    ];
  }

  /**
   * Caffeine as a wakefulness countermeasure. ~300 mg in the morning (ideally
   * slow-release) cut daytime sleepiness and sped recovery after a 7-zone eastbound
   * flight (Beaumont 2004). Hard cutoff ~7 h before bed to protect the shifted sleep.
   */
  private static caffeineActions(
    sleep: { start: string; end: string },
    segment: "pre" | "in_flight" | "post",
  ): Action[] {
    const cutoff = this.subtractMinutes(sleep.start, 420); // ~7 h before target bedtime
    return [
      {
        type: "caffeine_ok",
        start_local: sleep.end,
        end_local: cutoff,
        at_local: null,
        rationale:
          segment === "post"
            ? "~300 mg in the morning (slow-release is ideal) to hold wakefulness and speed recovery"
            : "Caffeine OK from waking until the cutoff",
      },
      {
        type: "caffeine_cutoff",
        start_local: null,
        end_local: null,
        at_local: cutoff,
        rationale:
          "No caffeine after this — its ~5–7 h half-life would erode your shifted sleep",
      },
    ];
  }

  /**
   * Meals are a secondary (peripheral-clock) zeitgeber. Eating on destination time —
   * and ideally fasting through the flight to break it at destination breakfast —
   * reinforces the light-driven shift.
   */
  /**
   * Guidance for significant (≥5 h) connecting-flight layovers in a third timezone.
   * Overnight layover → sleep (it counts); long daytime layover → light + movement
   * in the direction you're shifting. Anchored trips only use the sleep case.
   */
  private static layoverActions(
    trip: Trip,
    direction: "advance" | "delay" | "anchor",
  ): Action[] {
    if (!trip.layovers?.length) return [];
    const out: Action[] = [];
    for (const lo of trip.layovers) {
      const durH =
        (new Date(lo.dep_local).getTime() - new Date(lo.arr_local).getTime()) /
        3_600_000;
      if (!(durH >= 5)) continue;
      const startC = this.formatTime(new Date(lo.arr_local), lo.tz);
      const endC = this.formatTime(new Date(lo.dep_local), lo.tz);
      const city = lo.city || "your layover";
      const startHour = parseInt(startC.slice(0, 2), 10);
      const overnight = startHour >= 21 || startHour <= 4;
      if (overnight) {
        out.push({
          type: "sleep",
          start_local: startC,
          end_local: endC,
          at_local: null,
          rationale: `Long overnight layover in ${city} (${Math.round(durH)}h) — sleep here; it counts toward your plan.`,
        });
      } else if (direction !== "anchor") {
        out.push({
          type: "seek_light",
          start_local: startC,
          end_local: endC,
          at_local: null,
          intensity: "moderate",
          rationale: `${Math.round(durH)}h layover in ${city} — get bright light and move around to help ${direction === "advance" ? "advance" : "delay"} your clock and stay alert.`,
        });
      }
    }
    return out;
  }

  /** Do two HH:MM intervals overlap? Handles windows that cross midnight. */
  private static intervalsOverlap(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string,
  ): boolean {
    const span = (s: string, e: string): [number, number] => {
      const a = this.timeToMinutes(s);
      let b = this.timeToMinutes(e);
      if (b <= a) b += 1440; // wrap past midnight
      return [a, b];
    };
    const [a0, a1] = span(aStart, aEnd);
    const [b0, b1] = span(bStart, bEnd);
    // Compare on a 0–2880 line, testing both phase alignments for the wrap case.
    return (
      (a0 < b1 && b0 < a1) ||
      (a0 < b1 + 1440 && b0 + 1440 < a1) ||
      (a0 + 1440 < b1 && b0 < a1 + 1440)
    );
  }

  /**
   * Commitment-aware planning. For each fixed event that day we surface it, and warn
   * when it collides with the body clock: overlapping planned sleep (you'll be
   * under-slept) or sitting in the post-CBTmin circadian low (peak grogginess) — with
   * the countermeasure (bright light + caffeine beforehand).
   */
  private static commitmentActions(
    trip: Trip,
    date: string,
    sleep: { start: string; end: string },
    cbtMinLocal: string,
  ): Action[] {
    const todays = (trip.commitments ?? []).filter(
      (c) => c.date_local === date,
    );
    return todays.map((c) => {
      const overlapsSleep = this.intervalsOverlap(
        c.start_local,
        c.end_local,
        sleep.start,
        sleep.end,
      );
      // Circadian low = CBTmin to ~3 h after (worst alertness / reaction time).
      const lowEnd = this.addMinutes(cbtMinLocal, 180);
      const inLow = this.intervalsOverlap(
        c.start_local,
        c.end_local,
        cbtMinLocal,
        lowEnd,
      );

      let rationale: string;
      if (inLow) {
        rationale =
          "⚠ Lands at your body-clock low — expect grogginess. Get bright light and caffeine 30–60 min before.";
      } else if (overlapsSleep) {
        rationale =
          "⚠ Overlaps your target sleep — you’ll be running short; nap earlier and caffeinate before.";
      } else {
        rationale = "Well-timed against your body clock — you should be alert.";
      }
      return {
        type: "commitment" as const,
        label: c.title,
        start_local: c.start_local,
        end_local: c.end_local,
        at_local: null,
        rationale,
      };
    });
  }

  private static mealAction(
    sleep: { start: string; end: string },
    segment: "pre" | "in_flight" | "post",
    isAnchor: boolean,
  ): Action {
    const breakfast = this.addMinutes(sleep.end, 30);
    return {
      type: "meal",
      start_local: breakfast,
      end_local: this.addMinutes(breakfast, 45),
      at_local: null,
      rationale: isAnchor
        ? "Keep meals on home time too — eating at destination meal times would start pulling your clock you’re trying not to move"
        : segment === "in_flight"
          ? "Eat on destination meal times. Fasting through the flight and breaking it at destination breakfast helps your gut clock re-entrain."
          : "Anchor meals — especially breakfast — to destination time to reinforce the shift",
    };
  }

  /**
   * Helper methods
   */
  private static addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const normalizedMinutes =
      ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const newHours = Math.floor(normalizedMinutes / 60);
    const newMins = normalizedMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
  }

  private static subtractMinutes(time: string, minutes: number): string {
    return this.addMinutes(time, -minutes);
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  private static getPlanDayDate(trip: Trip, dayOffset: number): string {
    const baseDate = new Date(trip.dep_local);
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + dayOffset);
    return targetDate.toISOString().split("T")[0]; // YYYY-MM-DD format
  }

  private static getPlanDayLocation(
    trip: Trip,
    dayOffset: number,
    segment: string,
  ): PlanDay["location"] {
    if (segment === "in_flight") {
      return {
        label: "In flight",
        tz: trip.origin_tz, // Use origin timezone for in-flight
        segment: "in_flight",
      };
    } else if (dayOffset < 0) {
      return {
        label: trip.origin_iata,
        tz: trip.origin_tz,
        segment: "pre",
      };
    } else {
      return {
        label: trip.dest_iata,
        tz: trip.dest_tz,
        segment: "post",
      };
    }
  }

  private static generateDayNotes(
    segment: string,
    cumulativeShift: number,
  ): string[] {
    const notes: string[] = [];

    if (segment === "pre") {
      notes.push("Pre-travel preparation phase");
    } else if (segment === "in_flight") {
      notes.push("During flight - maintain plan as much as possible");
    } else {
      notes.push("Post-arrival adjustment phase");
    }

    if (Math.abs(cumulativeShift) > 0) {
      notes.push(`Cumulative shift: ${cumulativeShift.toFixed(1)} hours`);
    }

    return notes;
  }

  private static getCurrentTimezone(trip: Trip, now: Date): string {
    const depDate = new Date(trip.dep_local);
    const arrDate = new Date(trip.arr_local);

    if (now < depDate) {
      return trip.origin_tz;
    } else if (now > arrDate) {
      return trip.dest_tz;
    } else {
      // In flight - use origin timezone for simplicity
      return trip.origin_tz;
    }
  }

  private static formatTime(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  private static findCurrentPlanDay(
    planDays: PlanDay[],
    now: Date,
    currentTz: string,
  ): PlanDay | null {
    const today = now.toISOString().split("T")[0];
    return planDays.find((day) => day.date_local === today) || null;
  }

  private static findCurrentAction(
    actions: Action[],
    currentTime: string,
  ): Action | null {
    return (
      actions.find((action) => {
        if (action.start_local && action.end_local) {
          return (
            currentTime >= action.start_local && currentTime <= action.end_local
          );
        } else if (action.at_local) {
          // For point-in-time actions, consider a 30-minute window
          const actionTime = this.timeToMinutes(action.at_local);
          const currentMinutes = this.timeToMinutes(currentTime);
          const diff = Math.abs(currentMinutes - actionTime);
          return diff <= 30;
        }
        return false;
      }) || null
    );
  }

  private static findNextAction(
    actions: Action[],
    currentTime: string,
  ): Action | null {
    const sortedActions = actions
      .filter((action) => {
        const actionTime = action.start_local || action.at_local || "00:00";
        return actionTime > currentTime;
      })
      .sort((a, b) => {
        const timeA = a.start_local || a.at_local || "00:00";
        const timeB = b.start_local || b.at_local || "00:00";
        return timeA.localeCompare(timeB);
      });

    return sortedActions[0] || null;
  }

  private static getActionLabel(action: Action): string {
    switch (action.type) {
      case "sleep":
        return "Sleep";
      case "seek_light":
        return "Seek bright light";
      case "avoid_light":
        return "Avoid light";
      case "caffeine_ok":
        return "Caffeine OK";
      case "caffeine_cutoff":
        return "Caffeine cutoff";
      case "melatonin":
        return "Take melatonin";
      case "nap":
        return "Nap";
      case "meal":
        return "Meal timing";
      case "commitment":
        return "Commitment";
      default:
        return action.type;
    }
  }

  private static getDefaultExplanation(action: Action): string {
    return action.rationale || "Follow circadian adjustment plan";
  }
}

/**
 * Flight lookup service (mock implementation)
 * In production, this would integrate with a flight data API
 */
export class FlightLookupService {
  static async lookupFlight(
    carrier: string,
    number: string,
    _date: string,
  ): Promise<FlightLookupResult | null> {
    // Mock DB for now; replace with a real flight API when available.
    return findMockFlight(carrier, number);
  }
}
