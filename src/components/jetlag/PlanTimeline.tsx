import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanDay, Action } from '../../types';

interface PlanTimelineProps {
  planDays: PlanDay[];
  currentDay?: string; // YYYY-MM-DD format
  mode?: 'vertical' | 'horizontal'; // horizontal shows an x-axis of dates
}

const { width } = Dimensions.get('window');

export const PlanTimeline: React.FC<PlanTimelineProps> = ({
  planDays,
  currentDay,
  mode = 'horizontal',
}) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const initialSelectedDayId = (currentDay && planDays.find(d => d.date_local === currentDay)?.id) || planDays[0]?.id || null;
  const [selectedDayId, setSelectedDayId] = useState<string | null>(initialSelectedDayId);
  const alwaysExpanded = mode === 'horizontal';

  // Timeshifter-style colors
  const getBarColor = (type: Action['type']) => {
    switch (type) {
      case 'sleep':
        return '#0B84F6'; // Bright blue for sleep - more visible
      case 'seek_light':
        return '#F5B300'; // Yellow
      case 'avoid_light':
        return '#FF9500'; // Orange (for avoid light icon)
      case 'caffeine_ok':
        return '#8B5E34'; // Brown
      case 'caffeine_cutoff':
        return '#D4A574'; // Light brown/beige
      case 'melatonin':
        return '#7C3AED'; // Purple
      case 'nap':
        return '#0B84F6'; // Same blue as sleep for naps
      default:
        return '#3F3F46'; // Gray
    }
  };

  const getBarStyle = (type: Action['type']) => {
    if (type === 'caffeine_cutoff') {
      return {
        backgroundColor: '#F5E6D3', // Light beige background
        borderWidth: 2,
        borderColor: '#D4A574', // Light brown border
        borderStyle: 'solid' as const,
      };
    }
    // Make sleep bars more prominent with a subtle border
    if (type === 'sleep' || type === 'nap') {
      return {
        backgroundColor: getBarColor(type),
        borderWidth: 1,
        borderColor: '#0066CC', // Darker blue border for contrast
        borderStyle: 'solid' as const,
      };
    }
    return {
      backgroundColor: getBarColor(type),
      borderWidth: 0,
    };
  };

  const getBarIcon = (type: Action['type']) => {
    switch (type) {
      case 'sleep':
        return '😴'; // Sleeping face emoji
      case 'seek_light':
        return '☀️'; // Sun emoji
      case 'avoid_light':
        return '🚫☀️'; // No sun emoji
      case 'caffeine_ok':
        return '☕'; // Coffee emoji
      case 'caffeine_cutoff':
        return '🚫☕'; // No coffee emoji
      case 'melatonin':
        return '💊'; // Pill emoji
      case 'nap':
        return '😴'; // Nap emoji (sleeping face)
      default:
        return '';
    }
  };

  // Timeline constants
  const HOUR_HEIGHT = 32; // px per hour
  const CHART_HEIGHT = 24 * HOUR_HEIGHT;
  const LABEL_COL_WIDTH = 50;
  const BAR_WIDTH = 40;
  const BAR_SPACING = 8;

  const timeToMinutes = (hhmm: string | null): number | null => {
    if (!hhmm) return null;
    try {
      const [h, m] = hhmm.split(':').map(v => parseInt(v, 10));
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    } catch {
      return null;
    }
  };

  const minutesToTop = (minutes: number): number => {
    const clamped = Math.max(0, Math.min(1440, minutes));
    return (clamped / 1440) * CHART_HEIGHT;
  };

  const minutesToHeight = (startMinutes: number, endMinutes: number): number => {
    let start = Math.max(0, Math.min(1440, startMinutes));
    let end = Math.max(0, Math.min(1440, endMinutes));
    
    // Handle sleep that spans midnight (e.g., 22:00 to 06:00)
    if (end < start) {
      // Sleep wraps around midnight, so end is the next day
      end = 1440; // End of current day
    }
    
    const height = ((end - start) / 1440) * CHART_HEIGHT;
    return Math.max(8, height); // Increased minimum height for better visibility
  };

  const formatHourLabel = (h: number) => {
    return `${h.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = days[date.getDay()];
      const month = months[date.getMonth()];
      const dayNum = date.getDate();
      return `${day}, ${month} ${dayNum}`;
    } catch {
      return dateString;
    }
  };

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'pre':
        return 'PRE-TRAVEL';
      case 'in_flight':
        return 'IN FLIGHT';
      case 'post':
        return 'POST-ARRIVAL';
      case 'layover':
        return 'LAYOVER';
      default:
        return segment.toUpperCase();
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'pre':
        return '#F5B300';
      case 'in_flight':
        return '#0B84F6';
      case 'post':
        return '#10B981';
      case 'layover':
        return '#7C3AED';
      default:
        return '#6B7280';
    }
  };

  const isCurrentDay = (date: string) => {
    return currentDay === date;
  };

  // Render a single day's timeline
  const renderDayTimeline = (planDay: PlanDay, dayIndex: number) => {
    const actions = planDay.actions;
    const sortedActions = [...actions].sort((a, b) => {
      const timeA = a.start_local || a.at_local || '00:00';
      const timeB = b.start_local || b.at_local || '00:00';
      return timeA.localeCompare(timeB);
    });

    // Check if this day is in flight
    const isInFlight = planDay.location.segment === 'in_flight';

    // Calculate bar positions - group similar types together
    const bars: Array<{
      action: Action;
      top: number;
      height: number;
      left: number;
      color: string;
      style: any;
      icon: string;
    }> = [];

    // Group actions by type for better positioning
    const lightActions: Action[] = [];
    const caffeineActions: Action[] = [];
    const sleepActions: Action[] = [];
    const otherActions: Action[] = [];

    sortedActions.forEach((action) => {
      if (action.type === 'seek_light' || action.type === 'avoid_light') {
        lightActions.push(action);
      } else if (action.type === 'caffeine_ok' || action.type === 'caffeine_cutoff') {
        caffeineActions.push(action);
      } else if (action.type === 'sleep' || action.type === 'nap') {
        sleepActions.push(action);
      } else {
        otherActions.push(action);
      }
    });

    // Position bars: Timeshifter style - light on left, caffeine next to it, sleep on right
    const baseLeft = 20;

    // Light exposure bars (yellow/orange) - left side
    lightActions.forEach((action) => {
      if (action.type === 'avoid_light') {
        // Avoid light is shown as an icon at the time point
        const minutes = timeToMinutes(action.at_local);
        if (minutes !== null) {
          bars.push({
            action,
            top: minutesToTop(minutes) - 10,
            height: 20,
            left: baseLeft,
            color: '#FF9500',
            style: { backgroundColor: 'transparent' },
            icon: '🚫☀️', // No sun icon
          });
        }
      } else if (action.type === 'seek_light' && action.start_local && action.end_local) {
        // Seek light shows as a yellow bar with sun icon
        const startMinutes = timeToMinutes(action.start_local);
        const endMinutes = timeToMinutes(action.end_local);
        if (startMinutes !== null && endMinutes !== null) {
          bars.push({
            action,
            top: minutesToTop(startMinutes),
            height: minutesToHeight(startMinutes, endMinutes),
            left: baseLeft,
            color: getBarColor(action.type),
            style: getBarStyle(action.type),
            icon: '☀️', // Sun icon for sunlight
          });
        }
      }
    });

    // Caffeine bars (brown) - positioned next to light bars (can overlap in time)
    const caffeineLeft = baseLeft + BAR_WIDTH + BAR_SPACING;
    caffeineActions.forEach((action) => {
      if (action.type === 'caffeine_ok' && action.start_local && action.end_local) {
        // Coffee OK - brown bar with coffee icon
        const startMinutes = timeToMinutes(action.start_local);
        const endMinutes = timeToMinutes(action.end_local);
        if (startMinutes !== null && endMinutes !== null) {
          bars.push({
            action,
            top: minutesToTop(startMinutes),
            height: minutesToHeight(startMinutes, endMinutes),
            left: caffeineLeft,
            color: getBarColor(action.type),
            style: getBarStyle(action.type),
            icon: '☕', // Coffee icon
          });
        }
      } else if (action.type === 'caffeine_cutoff' && action.start_local && action.end_local) {
        // Coffee cutoff - light brown outlined bar with no coffee icon
        const startMinutes = timeToMinutes(action.start_local);
        const endMinutes = timeToMinutes(action.end_local);
        if (startMinutes !== null && endMinutes !== null) {
          bars.push({
            action,
            top: minutesToTop(startMinutes),
            height: minutesToHeight(startMinutes, endMinutes),
            left: caffeineLeft,
            color: getBarColor(action.type),
            style: getBarStyle(action.type),
            icon: '🚫☕', // No coffee icon
          });
        }
      } else if (action.at_local) {
        const minutes = timeToMinutes(action.at_local);
        if (minutes !== null) {
          bars.push({
            action,
            top: minutesToTop(minutes) - 10,
            height: 20,
            left: caffeineLeft,
            color: getBarColor(action.type),
            style: getBarStyle(action.type),
            icon: action.type === 'caffeine_cutoff' ? '🚫☕' : '☕', // No coffee or coffee icon
          });
        }
      }
    });

    // Sleep bars (blue) - positioned on the right side
    const sleepLeft = caffeineLeft + BAR_WIDTH + BAR_SPACING;
    sleepActions.forEach((action) => {
      if (action.type === 'sleep' && action.start_local && action.end_local) {
        // Sleep - blue bar with sleeping face icon
        const startMinutes = timeToMinutes(action.start_local);
        const endMinutes = timeToMinutes(action.end_local);
        if (startMinutes !== null && endMinutes !== null) {
          const height = minutesToHeight(startMinutes, endMinutes);
          const top = minutesToTop(startMinutes);
          console.log(`[PlanTimeline] Rendering sleep bar: ${action.start_local} to ${action.end_local}, top: ${top}, height: ${height}, left: ${sleepLeft}`);
          bars.push({
            action,
            top,
            height,
            left: sleepLeft,
            color: getBarColor(action.type),
            style: getBarStyle(action.type),
            icon: '😴', // Sleeping face icon
          });
        } else {
          console.warn(`[PlanTimeline] Invalid sleep times: start=${action.start_local}, end=${action.end_local}`);
        }
      } else if (action.type === 'nap' && action.start_local && action.end_local) {
        // Nap - blue bar with sleeping face icon
        const startMinutes = timeToMinutes(action.start_local);
        const endMinutes = timeToMinutes(action.end_local);
        if (startMinutes !== null && endMinutes !== null) {
          bars.push({
            action,
            top: minutesToTop(startMinutes),
            height: minutesToHeight(startMinutes, endMinutes),
            left: sleepLeft,
            color: getBarColor(action.type),
            style: getBarStyle(action.type),
            icon: '😴', // Sleeping face icon for nap
          });
        }
      }
    });

    // Other actions (melatonin, etc.) - positioned to the right
    const otherLeft = sleepLeft + BAR_WIDTH + BAR_SPACING;
    otherActions.forEach((action) => {
      if (action.at_local) {
        const minutes = timeToMinutes(action.at_local);
        if (minutes !== null) {
          bars.push({
            action,
            top: minutesToTop(minutes) - 10,
            height: 20,
            left: otherLeft,
            color: getBarColor(action.type),
            style: getBarStyle(action.type),
            icon: getBarIcon(action.type),
          });
        }
      }
    });

    // Generate hour labels
    const hourLabels = [];
    for (let h = 0; h < 24; h++) {
      hourLabels.push(h);
    }

    return (
      <View key={planDay.id} style={styles.dayTimelineContainer}>
        {/* Date and location header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatDate(planDay.date_local)}</Text>
          <View style={styles.locationRow}>
            {isInFlight ? (
              <Text style={styles.planeIcon}>✈️</Text>
            ) : (
              <Ionicons name="time-outline" size={14} color="#8E8E93" />
            )}
            <Text style={styles.locationText}>
              {isInFlight ? 'In flight' : planDay.location.label} {planDay.location.tz ? planDay.location.tz.split('/').pop()?.replace('_', ' ') : ''}
            </Text>
          </View>
        </View>

        {/* Timeline chart */}
        <View style={styles.timelineChartContainer}>
          {/* Left hour labels */}
          <View style={styles.hourLabelsLeft}>
            {hourLabels.map((hour) => (
              <View key={`left-${hour}`} style={[styles.hourLabelRow, { height: HOUR_HEIGHT }]}>
                <Text style={styles.hourLabelText}>{formatHourLabel(hour)}</Text>
              </View>
            ))}
          </View>

          {/* Chart area with bars */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            {hourLabels.map((hour) => (
              <View
                key={`grid-${hour}`}
                style={[
                  styles.gridLine,
                  { top: hour * HOUR_HEIGHT },
                ]}
              />
            ))}

            {/* Activity bars */}
            {bars.map((bar, index) => {
              // Make sleep bars slightly wider for better visibility
              const isSleep = bar.action.type === 'sleep' || bar.action.type === 'nap';
              const barWidth = isSleep ? BAR_WIDTH + 4 : BAR_WIDTH;
              
              return (
                <View
                  key={`bar-${index}`}
                  style={[
                    styles.activityBar,
                    {
                      top: bar.top,
                      height: Math.max(bar.height, isSleep ? 10 : 4), // Ensure sleep bars are at least 10px tall
                      left: bar.left,
                      width: barWidth,
                    },
                    bar.style,
                  ]}
                >
                  {bar.icon && (
                    <Text style={styles.barIcon}>{bar.icon}</Text>
                  )}
                </View>
              );
            })}

            {/* In-flight indicator - show plane icon if in flight */}
            {isInFlight && (
              <View style={styles.inFlightIndicator}>
                <Text style={styles.planeIconLarge}>✈️</Text>
              </View>
            )}
          </View>

          {/* Right hour labels */}
          <View style={styles.hourLabelsRight}>
            {hourLabels.map((hour) => (
              <View key={`right-${hour}`} style={[styles.hourLabelRow, { height: HOUR_HEIGHT }]}>
                <Text style={styles.hourLabelText}>{formatHourLabel(hour)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (planDays.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No Plan Generated</Text>
        <Text style={styles.emptySubtitle}>
          Create a trip to generate your personalized jet lag plan
        </Text>
      </View>
    );
  }

  const daysToRender = mode === 'horizontal' && selectedDayId
    ? planDays.filter(d => d.id === selectedDayId)
    : planDays;

  return (
    <View style={styles.container}>
      {mode === 'horizontal' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateStrip}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {planDays.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.dateChip, selectedDayId === d.id && styles.dateChipSelected]}
              onPress={() => setSelectedDayId(d.id)}
            >
              <View style={[styles.dateDot, { backgroundColor: getSegmentColor(d.location.segment) }]} />
              <View>
                <Text style={[styles.dateChipText, selectedDayId === d.id && styles.dateChipTextSelected]}>
                  {formatDate(d.date_local)}
                </Text>
                <Text style={styles.dateChipSubText}>{d.location.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        {daysToRender.map((planDay, index) => (
          <View key={planDay.id}>
            {renderDayTimeline(planDay, index)}
            {index < daysToRender.length - 1 && (
              <View style={styles.daySeparator}>
                <Text style={styles.daySeparatorText}>{formatDate(planDays[index + 1]?.date_local)}</Text>
                <Text style={styles.daySeparatorTime}>
                  {planDays[index + 1]?.location.label} 00:00
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  timelineScroll: {
    flex: 1,
  },
  dateStrip: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F20',
    backgroundColor: '#000000',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginHorizontal: 4,
    backgroundColor: '#0B0B0C',
  },
  dateChipSelected: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  dateChipText: {
    color: '#E5E5E7',
    fontSize: 13,
    fontWeight: '600',
  },
  dateChipTextSelected: {
    color: '#FFFFFF',
  },
  dateChipSubText: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  dayTimelineContainer: {
    backgroundColor: '#0B0B0C',
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timelineChartContainer: {
    flexDirection: 'row',
    height: 768, // 24 hours * 32px
  },
  hourLabelsLeft: {
    width: 50,
    paddingRight: 8,
  },
  hourLabelsRight: {
    width: 50,
    paddingLeft: 8,
  },
  hourLabelRow: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  hourLabelText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0B0B0C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F1F20',
    marginHorizontal: 8,
    minHeight: 768,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#1F1F20',
  },
  activityBar: {
    position: 'absolute',
    borderRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    zIndex: 1, // Ensure bars are above grid lines
  },
  barIcon: {
    fontSize: 16,
    textAlign: 'center',
  },
  planeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  planeIconLarge: {
    fontSize: 24,
  },
  inFlightIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    opacity: 0.3,
  },
  daySeparator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1F1F20',
    backgroundColor: '#0B0B0C',
  },
  daySeparatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  daySeparatorTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
