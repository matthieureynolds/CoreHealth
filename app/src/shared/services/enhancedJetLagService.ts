import { Trip, PlanDay, Action, NowCard, FlightLookupResult } from '../types';

/**
 * Enhanced Jet Lag Service
 * Implements PRC-based circadian rhythm optimization
 * Following the comprehensive plan specification
 */

/**
 * Generate a personalized, day-by-day circadian shift plan
 */
export class EnhancedJetLagService {
  /**
   * Generate plan for a trip
   */
  static generatePlan(trip: Trip): PlanDay[] {
    const { tz_diff_hours, direction, plan_style, prefs } = trip;
    
    // Choose horizon (days to display)
    const horizon = this.chooseHorizon(Math.abs(tz_diff_hours), plan_style);
    
    // Determine daily shift size
    const dailyShift = this.getDailyShiftSize(direction, plan_style);
    
    // Generate plan days
    const planDays: PlanDay[] = [];
    
    // Pre-travel days
    for (let i = horizon.preDays; i > 0; i--) {
      const dayOffset = -i;
      const cumulativeShift = this.calculateCumulativeShift(dayOffset, dailyShift, tz_diff_hours);
      
      planDays.push(this.createPlanDay(
        trip,
        dayOffset,
        'pre',
        cumulativeShift,
        prefs
      ));
    }
    
    // In-flight day
    planDays.push(this.createPlanDay(
      trip,
      0,
      'in_flight',
      this.calculateCumulativeShift(0, dailyShift, tz_diff_hours),
      prefs
    ));
    
    // Post-travel days
    for (let i = 1; i <= horizon.postDays; i++) {
      const dayOffset = i;
      const cumulativeShift = this.calculateCumulativeShift(dayOffset, dailyShift, tz_diff_hours);
      
      planDays.push(this.createPlanDay(
        trip,
        dayOffset,
        'post',
        cumulativeShift,
        prefs
      ));
    }
    
    return planDays;
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
        next_action_preview: undefined
      };
    }
    
    // Find current action
    const currentAction = this.findCurrentAction(currentPlanDay.actions, currentTime);
    const nextAction = this.findNextAction(currentPlanDay.actions, currentTime);
    
    return {
      trip_id: trip.id,
      generated_at_local: now.toISOString(),
      current_location_tz: currentTz,
      current_action: currentAction ? {
        label: this.getActionLabel(currentAction),
        window: {
          start_local: currentAction.start_local || currentAction.at_local || '',
          end_local: currentAction.end_local || currentAction.at_local || ''
        },
        explain: currentAction.rationale || this.getDefaultExplanation(currentAction),
        cta: 'Done'
      } : null,
      next_action_preview: nextAction ? `Next: ${this.getActionLabel(nextAction)} ${nextAction.start_local || nextAction.at_local}` : undefined
    };
  }
  
  /**
   * Choose plan horizon based on timezone difference and style
   */
  private static chooseHorizon(tzDiff: number, style: 'gentle' | 'aggressive'): { preDays: number; postDays: number } {
    if (tzDiff <= 3) {
      return { preDays: 1, postDays: 2 };
    } else if (tzDiff >= 8 && style === 'aggressive') {
      return { preDays: 3, postDays: 4 };
    } else {
      return { preDays: 2, postDays: 3 };
    }
  }
  
  /**
   * Get daily shift size based on direction and style
   */
  private static getDailyShiftSize(direction: 'east' | 'west', style: 'gentle' | 'aggressive'): number {
    if (direction === 'east') {
      return style === 'gentle' ? 1.0 : 1.5;
    } else {
      return style === 'gentle' ? 1.25 : 1.75;
    }
  }
  
  /**
   * Calculate cumulative shift for a given day
   */
  private static calculateCumulativeShift(dayOffset: number, dailyShift: number, tzDiff: number): number {
    const maxShift = Math.abs(tzDiff);
    const rawShift = dayOffset * dailyShift;
    const direction = tzDiff > 0 ? 1 : -1;
    
    // Cap cumulative shift at timezone difference
    const cappedShift = Math.min(Math.abs(rawShift), maxShift);
    return cappedShift * direction;
  }
  
  /**
   * Create a plan day with actions
   */
  private static createPlanDay(
    trip: Trip,
    dayOffset: number,
    segment: 'pre' | 'in_flight' | 'post',
    cumulativeShift: number,
    prefs: Trip['prefs']
  ): PlanDay {
    const date = this.getPlanDayDate(trip, dayOffset);
    const location = this.getPlanDayLocation(trip, dayOffset, segment);
    
    const actions: Action[] = [];
    
    // Calculate shifted sleep window
    const shiftedSleep = this.calculateShiftedSleep(prefs.sleep_window_local, cumulativeShift);
    
    // Add sleep action
    actions.push({
      type: 'sleep',
      start_local: shiftedSleep.start,
      end_local: shiftedSleep.end,
      at_local: null,
      rationale: 'Target sleep window for circadian adjustment'
    });

    // Add in-flight block for flight day
    if (segment === 'in_flight') {
      const depTime = this.formatTime(new Date(trip.dep_local), trip.origin_tz);
      const arrTime = this.formatTime(new Date(trip.arr_local), trip.origin_tz);
      actions.push({
        type: 'in_flight',
        start_local: depTime,
        end_local: arrTime,
        at_local: null,
        rationale: 'Flight window'
      });
    }
    
    // Add light exposure actions based on PRC heuristics
    const lightActions = this.generateLightActions(
      shiftedSleep,
      prefs.chronotype,
      cumulativeShift,
      trip.direction
    );
    actions.push(...lightActions);
    
    // Add caffeine actions if enabled
    if (prefs.caffeine) {
      const caffeineActions = this.generateCaffeineActions(shiftedSleep);
      actions.push(...caffeineActions);
    }
    
    // Add melatonin action if enabled and eastbound
    if (prefs.melatonin && trip.direction === 'east') {
      actions.push({
        type: 'melatonin',
        start_local: null,
        end_local: null,
        at_local: this.subtractMinutes(shiftedSleep.start, 30),
        rationale: 'Melatonin to advance circadian rhythm'
      });
    }
    
    // Sort actions by time
    actions.sort((a, b) => {
      const timeA = a.start_local || a.at_local || '00:00';
      const timeB = b.start_local || b.at_local || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    return {
      id: `${trip.id}-day-${dayOffset}`,
      trip_id: trip.id,
      date_local: date,
      location,
      actions,
      notes: this.generateDayNotes(segment, cumulativeShift)
    };
  }
  
  /**
   * Calculate shifted sleep window
   */
  private static calculateShiftedSleep(
    originalSleep: { start: string; end: string },
    cumulativeShift: number
  ): { start: string; end: string } {
    // Positive cumulativeShift indicates eastbound (advance clock → earlier times)
    // Negative indicates westbound (delay clock → later times)
    const minutes = Math.abs(cumulativeShift) * 60;

    if (cumulativeShift > 0) {
      // Earlier bed and wake times
      return {
        start: this.subtractMinutes(originalSleep.start, minutes),
        end: this.subtractMinutes(originalSleep.end, minutes)
      };
    }
    // Later bed and wake times
    return {
      start: this.addMinutes(originalSleep.start, minutes),
      end: this.addMinutes(originalSleep.end, minutes)
    };
  }
  
  /**
   * Generate light exposure actions based on PRC heuristics
   */
  private static generateLightActions(
    sleepWindow: { start: string; end: string },
    chronotype: 'morning' | 'neutral' | 'evening',
    cumulativeShift: number,
    direction: 'east' | 'west'
  ): Action[] {
    const actions: Action[] = [];
    
    // Calculate biological midpoint (sleep midpoint + chronotype offset)
    const sleepMidpoint = this.calculateMidpoint(sleepWindow.start, sleepWindow.end);
    const chronotypeOffset = this.getChronotypeOffset(chronotype);
    const biologicalMidpoint = this.addMinutes(sleepMidpoint, chronotypeOffset);
    
    if (direction === 'east') {
      // Eastbound: seek light in early morning, avoid in evening
      actions.push({
        type: 'seek_light',
        start_local: this.addMinutes(biologicalMidpoint, 60), // 1 hour after midpoint
        end_local: this.addMinutes(biologicalMidpoint, 180), // 3 hours after midpoint
        at_local: null,
        intensity: 'high',
        rationale: 'Bright light exposure to advance circadian rhythm'
      });
      
      actions.push({
        type: 'avoid_light',
        start_local: this.subtractMinutes(biologicalMidpoint, 240), // 4 hours before midpoint
        end_local: this.subtractMinutes(biologicalMidpoint, 60), // 1 hour before midpoint
        at_local: null,
        intensity: 'high',
        rationale: 'Avoid light to prevent phase delay'
      });
    } else {
      // Westbound: seek light in evening, avoid in early morning
      actions.push({
        type: 'seek_light',
        start_local: this.subtractMinutes(biologicalMidpoint, 180), // 3 hours before midpoint
        end_local: this.subtractMinutes(biologicalMidpoint, 60), // 1 hour before midpoint
        at_local: null,
        intensity: 'high',
        rationale: 'Bright light exposure to delay circadian rhythm'
      });
      
      actions.push({
        type: 'avoid_light',
        start_local: this.addMinutes(biologicalMidpoint, 60), // 1 hour after midpoint
        end_local: this.addMinutes(biologicalMidpoint, 180), // 3 hours after midpoint
        at_local: null,
        intensity: 'high',
        rationale: 'Avoid light to prevent phase advance'
      });
    }
    
    return actions;
  }
  
  /**
   * Generate caffeine-related actions
   */
  private static generateCaffeineActions(sleepWindow: { start: string; end: string }): Action[] {
    const actions: Action[] = [];
    
    // Caffeine OK from wake time
    actions.push({
      type: 'caffeine_ok',
      start_local: sleepWindow.end,
      end_local: this.subtractMinutes(sleepWindow.start, 480), // 8 hours before bedtime
      at_local: null,
      rationale: 'Caffeine window - avoid 8 hours before target sleep'
    });
    
    // Caffeine cutoff
    actions.push({
      type: 'caffeine_cutoff',
      start_local: null,
      end_local: null,
      at_local: this.subtractMinutes(sleepWindow.start, 480), // 8 hours before bedtime
      rationale: 'Caffeine cutoff to ensure quality sleep'
    });
    
    return actions;
  }
  
  /**
   * Helper methods
   */
  private static addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    const newHours = Math.floor(normalizedMinutes / 60);
    const newMins = normalizedMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }
  
  private static subtractMinutes(time: string, minutes: number): string {
    return this.addMinutes(time, -minutes);
  }
  
  private static calculateMidpoint(start: string, end: string): string {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    
    // Handle overnight sleep (end time is next day)
    const adjustedEndMinutes = endMinutes < startMinutes ? endMinutes + (24 * 60) : endMinutes;
    const midpointMinutes = (startMinutes + adjustedEndMinutes) / 2;
    
    return this.minutesToTime(midpointMinutes % (24 * 60));
  }
  
  private static getChronotypeOffset(chronotype: 'morning' | 'neutral' | 'evening'): number {
    switch (chronotype) {
      case 'morning': return -30; // 30 minutes earlier
      case 'evening': return 30;  // 30 minutes later
      default: return 0;
    }
  }
  
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  private static getPlanDayDate(trip: Trip, dayOffset: number): string {
    const baseDate = new Date(trip.dep_local);
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + dayOffset);
    return targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  private static getPlanDayLocation(trip: Trip, dayOffset: number, segment: string): PlanDay['location'] {
    if (segment === 'in_flight') {
      return {
        label: 'In flight',
        tz: trip.origin_tz, // Use origin timezone for in-flight
        segment: 'in_flight'
      };
    } else if (dayOffset < 0) {
      return {
        label: trip.origin_iata,
        tz: trip.origin_tz,
        segment: 'pre'
      };
    } else {
      return {
        label: trip.dest_iata,
        tz: trip.dest_tz,
        segment: 'post'
      };
    }
  }
  
  private static generateDayNotes(segment: string, cumulativeShift: number): string[] {
    const notes: string[] = [];
    
    if (segment === 'pre') {
      notes.push('Pre-travel preparation phase');
    } else if (segment === 'in_flight') {
      notes.push('During flight - maintain plan as much as possible');
    } else {
      notes.push('Post-arrival adjustment phase');
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
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }
  
  private static findCurrentPlanDay(planDays: PlanDay[], now: Date, currentTz: string): PlanDay | null {
    const today = now.toISOString().split('T')[0];
    return planDays.find(day => day.date_local === today) || null;
  }
  
  private static findCurrentAction(actions: Action[], currentTime: string): Action | null {
    return actions.find(action => {
      if (action.start_local && action.end_local) {
        return currentTime >= action.start_local && currentTime <= action.end_local;
      } else if (action.at_local) {
        // For point-in-time actions, consider a 30-minute window
        const actionTime = this.timeToMinutes(action.at_local);
        const currentMinutes = this.timeToMinutes(currentTime);
        const diff = Math.abs(currentMinutes - actionTime);
        return diff <= 30;
      }
      return false;
    }) || null;
  }
  
  private static findNextAction(actions: Action[], currentTime: string): Action | null {
    const sortedActions = actions.filter(action => {
      const actionTime = action.start_local || action.at_local || '00:00';
      return actionTime > currentTime;
    }).sort((a, b) => {
      const timeA = a.start_local || a.at_local || '00:00';
      const timeB = b.start_local || b.at_local || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    return sortedActions[0] || null;
  }
  
  private static getActionLabel(action: Action): string {
    switch (action.type) {
      case 'sleep': return 'Sleep';
      case 'seek_light': return 'Seek bright light';
      case 'avoid_light': return 'Avoid light';
      case 'caffeine_ok': return 'Caffeine OK';
      case 'caffeine_cutoff': return 'Caffeine cutoff';
      case 'melatonin': return 'Take melatonin';
      case 'nap': return 'Nap';
      default: return action.type;
    }
  }
  
  private static getDefaultExplanation(action: Action): string {
    return action.rationale || 'Follow circadian adjustment plan';
  }
}

/**
 * Flight lookup service (mock implementation)
 * In production, this would integrate with a flight data API
 */
export class FlightLookupService {
  static async lookupFlight(_carrier: string, _number: string, _date: string): Promise<FlightLookupResult | null> {
    // Returns null to trigger manual entry; replace with a real flight API when available
    return null;
  }
}
