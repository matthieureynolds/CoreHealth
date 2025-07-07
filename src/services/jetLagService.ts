import { JetLagData, JetLagSeverity, SleepScheduleAdjustment, LightExposureSchedule } from '../types';

/**
 * Jet Lag Service
 * Implements scientific jet lag calculations and adjustment recommendations
 * Following the principle of max 1.5 hours daily adjustment (Nico Rosberg's approach)
 */

/**
 * Calculate jet lag severity based on time zone difference
 */
export const calculateJetLagSeverity = (timeZoneDifference: number): JetLagSeverity => {
  const absDifference = Math.abs(timeZoneDifference);
  
  if (absDifference <= 2) {
    return 'minimal';
  } else if (absDifference <= 4) {
    return 'mild';
  } else if (absDifference <= 8) {
    return 'moderate';
  } else {
    return 'severe';
  }
};

/**
 * Calculate time zone difference between two timezone strings
 */
export const calculateTimeZoneDifference = (originTimezone: string, destinationTimezone: string): number => {
  try {
    const now = new Date();
    
    // Get UTC offset for origin timezone in minutes
    const originOffset = getTimezoneOffsetMinutes(originTimezone, now);
    
    // Get UTC offset for destination timezone in minutes
    const destinationOffset = getTimezoneOffsetMinutes(destinationTimezone, now);
    
    // Calculate difference in hours (destination - origin)
    const differenceHours = (destinationOffset - originOffset) / 60;
    
    // Debug logging
    console.log('=== Timezone Calculation Debug ===');
    console.log('Origin timezone:', originTimezone);
    console.log('Destination timezone:', destinationTimezone);
    console.log('Origin offset (minutes):', originOffset);
    console.log('Destination offset (minutes):', destinationOffset);
    console.log('Difference (hours):', differenceHours);
    console.log('Rounded difference:', Math.round(differenceHours));
    console.log('===================================');
    
    return Math.round(differenceHours);
  } catch (error) {
    console.error('Error calculating timezone difference:', error);
    return 0;
  }
};

/**
 * Get timezone offset in minutes from UTC for a given timezone
 * Uses a more reliable method with proper date parsing
 */
const getTimezoneOffsetMinutes = (timezone: string, date: Date): number => {
  try {
    // Get the time parts for the timezone
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const tzYear = parseInt(parts.find(part => part.type === 'year')?.value || '0');
    const tzMonth = parseInt(parts.find(part => part.type === 'month')?.value || '0') - 1; // Month is 0-indexed
    const tzDay = parseInt(parts.find(part => part.type === 'day')?.value || '0');
    const tzHour = parseInt(parts.find(part => part.type === 'hour')?.value || '0');
    const tzMinute = parseInt(parts.find(part => part.type === 'minute')?.value || '0');
    const tzSecond = parseInt(parts.find(part => part.type === 'second')?.value || '0');
    
    // Create a UTC date representing the timezone's local time
    const tzAsUtc = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond);
    
    // Calculate the offset in minutes
    const offsetMs = tzAsUtc - date.getTime();
    const offsetMinutes = offsetMs / (1000 * 60);
    
    // Return negative offset (west is negative, east is positive)
    return -offsetMinutes;
  } catch (error) {
    console.error(`Error getting timezone offset for ${timezone}:`, error);
    return 0;
  }
};

/**
 * Generate sleep schedule adjustment plan
 * Following the 1.5 hours max daily adjustment rule
 */
export const generateSleepScheduleAdjustment = (
  timeZoneDifference: number,
  currentBedtime: string = "22:00", // Default 10 PM
  currentWakeTime: string = "07:00"  // Default 7 AM
): SleepScheduleAdjustment => {
  const absDifference = Math.abs(timeZoneDifference);
  const isEastward = timeZoneDifference > 0;
  
  // Maximum adjustment per day (1.5 hours as per Nico's rule)
  const maxDailyAdjustment = 1.5;
  
  // Calculate number of days needed for full adjustment
  const daysToAdjust = Math.ceil(absDifference / maxDailyAdjustment);
  
  // Generate daily schedule
  const dailySchedule: Array<{
    day: number;
    bedtime: string;
    wakeTime: string;
    adjustment: number;
  }> = [];

  let remainingHours = absDifference;
  
  for (let day = 1; day <= daysToAdjust; day++) {
    const adjustmentForDay = Math.min(remainingHours, maxDailyAdjustment);
    remainingHours -= adjustmentForDay;
    
    // Calculate new times
    const bedtimeMinutes = parseTimeToMinutes(currentBedtime);
    const wakeTimeMinutes = parseTimeToMinutes(currentWakeTime);
    
    const adjustmentMinutes = adjustmentForDay * 60;
    const direction = isEastward ? 1 : -1; // Eastward = earlier, Westward = later
    
    const newBedtimeMinutes = bedtimeMinutes - (direction * adjustmentMinutes * day);
    const newWakeTimeMinutes = wakeTimeMinutes - (direction * adjustmentMinutes * day);
    
    dailySchedule.push({
      day,
      bedtime: formatMinutesToTime(newBedtimeMinutes),
      wakeTime: formatMinutesToTime(newWakeTimeMinutes),
      adjustment: adjustmentForDay * direction,
    });
  }

  return {
    totalTimeZoneDifference: timeZoneDifference,
    direction: isEastward ? 'eastward' : 'westward',
    daysToAdjust,
    maxDailyAdjustment,
    dailySchedule,
    strategy: isEastward ? 
      'Advance bedtime gradually each day before travel' : 
      'Delay bedtime gradually each day before travel',
    recommendations: generateSleepRecommendations(absDifference, isEastward),
  };
};

/**
 * Generate light exposure schedule for circadian rhythm adjustment
 */
export const generateLightExposureSchedule = (
  timeZoneDifference: number,
  currentTimezone: string,
  destinationTimezone: string
): LightExposureSchedule => {
  const absDifference = Math.abs(timeZoneDifference);
  const isEastward = timeZoneDifference > 0;
  
  const schedule: Array<{
    day: number;
    morningLight: string;
    eveningAvoidance: string;
    duration: number;
    notes: string;
  }> = [];

  const daysToAdjust = Math.ceil(absDifference / 1.5);
  
  for (let day = 1; day <= daysToAdjust; day++) {
    if (isEastward) {
      // For eastward travel - need to advance circadian rhythm
      schedule.push({
        day,
        morningLight: `06:00-08:00`,
        eveningAvoidance: `20:00-22:00`,
        duration: 30,
        notes: 'Bright light exposure in early morning, avoid evening light',
      });
    } else {
      // For westward travel - need to delay circadian rhythm
      schedule.push({
        day,
        morningLight: `08:00-10:00`,
        eveningAvoidance: `18:00-20:00`,
        duration: 30,
        notes: 'Later morning light exposure, extend evening light',
      });
    }
  }

  return {
    direction: isEastward ? 'eastward' : 'westward',
    strategy: isEastward ? 
      'Advance circadian rhythm with early bright light' : 
      'Delay circadian rhythm with later light exposure',
    schedule,
    generalTips: [
      'Use bright light therapy lamp (10,000 lux) if natural sunlight unavailable',
      'Wear sunglasses during light avoidance periods',
      'Consider melatonin supplementation as directed by healthcare provider',
      'Maintain consistent meal times aligned with new schedule',
    ],
  };
};

/**
 * Get current local time for destination
 */
export const getCurrentDestinationTime = (timezone: string): {
  time: string;
  date: string;
  timezone: string;
} => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      time: formatter.format(now),
      date: dateFormatter.format(now),
      timezone: timezone,
    };
  } catch (error) {
    console.error('Error getting destination time:', error);
    return {
      time: '00:00:00',
      date: 'Unknown',
      timezone: timezone,
    };
  }
};

/**
 * Generate comprehensive jet lag data
 */
export const generateJetLagData = (
  originTimezone: string,
  destinationTimezone: string,
  originLocation: string = 'Home',
  destinationLocation: string = 'Destination'
): JetLagData => {
  const timeZoneDifference = calculateTimeZoneDifference(originTimezone, destinationTimezone);
  const severity = calculateJetLagSeverity(timeZoneDifference);
  const sleepAdjustment = generateSleepScheduleAdjustment(timeZoneDifference);
  const lightSchedule = generateLightExposureSchedule(timeZoneDifference, originTimezone, destinationTimezone);
  const destinationTime = getCurrentDestinationTime(destinationTimezone);

  return {
    originTimezone,
    destinationTimezone,
    originLocation,
    destinationLocation,
    timeZoneDifference,
    severity,
    estimatedRecoveryDays: Math.abs(timeZoneDifference),
    sleepAdjustment,
    lightExposureSchedule: lightSchedule,
    destinationTime,
    recommendations: generateJetLagRecommendations(severity, timeZoneDifference),
  };
};

// Helper functions
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes: number): string => {
  // Handle negative minutes and wrap around 24 hours
  const normalizedMinutes = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const generateSleepRecommendations = (timeDifference: number, isEastward: boolean): string[] => {
  const recommendations = [
    `Start adjusting ${Math.ceil(timeDifference / 1.5)} days before travel`,
    'Maintain consistent meal times with your new schedule',
    'Stay hydrated but avoid caffeine 6 hours before new bedtime',
    'Create a relaxing bedtime routine in your new schedule',
  ];

  if (isEastward) {
    recommendations.push('Consider melatonin 30 minutes before new bedtime');
    recommendations.push('Expose yourself to bright light early in the morning');
  } else {
    recommendations.push('Avoid bright light in the evening');
    recommendations.push('Stay active later in the day to delay sleep');
  }

  return recommendations;
};

const generateJetLagRecommendations = (severity: JetLagSeverity, timeDifference: number): string[] => {
  const baseRecommendations = [
    'Stay hydrated during travel',
    'Avoid alcohol and excessive caffeine',
    'Set your watch to destination time when boarding',
  ];

  switch (severity) {
    case 'minimal':
      return [
        ...baseRecommendations,
        'Minimal adjustment needed - maintain regular sleep schedule',
      ];
    case 'mild':
      return [
        ...baseRecommendations,
        'Start adjusting sleep schedule 1-2 days before travel',
        'Use natural light exposure to help adjustment',
      ];
    case 'moderate':
      return [
        ...baseRecommendations,
        'Begin sleep schedule adjustment 3-4 days before travel',
        'Consider light therapy and melatonin supplementation',
        'Plan for 4-6 days of adjustment after arrival',
      ];
    case 'severe':
      return [
        ...baseRecommendations,
        'Start preparation 5-7 days before travel',
        'Consult with healthcare provider about sleep aids',
        'Consider breaking journey with stopovers if possible',
        'Plan for 7-10 days of adjustment after arrival',
        'Avoid important meetings for first few days if possible',
      ];
    default:
      return baseRecommendations;
  }
}; 