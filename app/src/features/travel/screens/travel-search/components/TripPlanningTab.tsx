import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TravelStackParamList, SerializedTrip } from '../../../../../shared/types';
import { styles } from '../TravelScreen.styles';

type Nav = CompositeNavigationProp<
  StackNavigationProp<TravelStackParamList, 'TravelList'>,
  StackNavigationProp<RootStackParamList>
>;

interface Trip {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  notes?: string;
  jetLagData?: any;
  isSequential?: boolean;
  previousTripImpact?: number;
  checklist?: {
    vaccines: Array<{ name: string; completed: boolean }>;
    medicines: Array<{ name: string; completed: boolean }>;
  };
  jetLagPlanner?: {
    departureTime: string;
    arrivalTime: string;
    outboundPlan: {
      direction: 'outbound';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
    returnPlan?: {
      direction: 'return';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
  };
}

function serializeTrip(t: Trip): SerializedTrip {
  return {
    id: t.id,
    departureLocation: t.departureLocation,
    destination: t.destination,
    departureDate: t.departureDate.toISOString(),
    returnDate: t.returnDate?.toISOString(),
    timezone: t.timezone,
    notes: t.notes,
    jetLagPlanner: t.jetLagPlanner,
  };
}

function getCityCode(location: string): string {
  const city = location.split(',')[0].trim();
  // Common city → code mappings
  const codes: Record<string, string> = {
    london: 'LDN', paris: 'PAR', madrid: 'MAD', tokyo: 'TYO',
    'new york': 'NYC', 'los angeles': 'LAX', dubai: 'DXB',
    singapore: 'SIN', sydney: 'SYD', rome: 'ROM', berlin: 'BER',
    amsterdam: 'AMS', bangkok: 'BKK', barcelona: 'BCN', lisbon: 'LIS',
    milan: 'MIL', munich: 'MUC', vienna: 'VIE', zurich: 'ZRH',
    istanbul: 'IST', cairo: 'CAI', nairobi: 'NBO', toronto: 'YTO',
    'san francisco': 'SFO', chicago: 'CHI', miami: 'MIA', seattle: 'SEA',
    boston: 'BOS', denver: 'DEN', honolulu: 'HNL', 'hong kong': 'HKG',
    seoul: 'SEL', beijing: 'PEK', shanghai: 'SHA', mumbai: 'BOM',
    delhi: 'DEL', 'cape town': 'CPT', rio: 'RIO', 'buenos aires': 'BUE',
    mexico: 'MEX', lagos: 'LOS', accra: 'ACC', marrakech: 'RAK',
  };
  return codes[city.toLowerCase()] || city.slice(0, 3).toUpperCase();
}

function getCityName(location: string): string {
  return location.split(',')[0].trim();
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function formatDay(date: Date): string {
  return date.getDate().toString();
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface TripPlanningTabProps {
  trips: Trip[];
  tripModalTranslateY: Animated.Value;
  onOpenAddTrip: () => void;
  onScrollOffset?: (offsetY: number) => void;
}

const TripPlanningTab: React.FC<TripPlanningTabProps> = ({
  trips,
  tripModalTranslateY,
  onOpenAddTrip,
  onScrollOffset,
}) => {
  const navigation = useNavigation<Nav>();

  const handleOpenAddTrip = () => {
    tripModalTranslateY.setValue(1000);
    Animated.spring(tripModalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    onOpenAddTrip();
  };

  // Sort trips by departure date (soonest first)
  const sortedTrips = [...trips].sort(
    (a, b) => a.departureDate.getTime() - b.departureDate.getTime()
  );

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={(e) => onScrollOffset?.(e.nativeEvent.contentOffset.y)}
    >
      <View style={[styles.content, styles.contentTrips]}>
        {sortedTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No trips planned</Text>
            <Text style={styles.emptyStateText}>
              Add your first trip to get personalized health recommendations
            </Text>
            <TouchableOpacity style={styles.addTripButton} onPress={handleOpenAddTrip}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addTripButtonText}>Add a Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tripsContainer}>
            {sortedTrips.map((trip) => {
              const daysUntil = getDaysUntil(trip.departureDate);
              const daysLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? '1 day' : daysUntil < 0 ? 'Past' : `${daysUntil} days`;

              return (
                <TouchableOpacity
                  key={trip.id}
                  style={bp.card}
                  onPress={() => navigation.navigate('TripDetail', { trip: serializeTrip(trip) })}
                  activeOpacity={0.7}
                >
                  {/* Left date strip */}
                  <View style={bp.dateStrip}>
                    <Text style={bp.dateMonth}>{formatMonth(trip.departureDate)}</Text>
                    <Text style={bp.dateDay}>{formatDay(trip.departureDate)}</Text>
                    <Text style={bp.dateYear}>{trip.departureDate.getFullYear()}</Text>
                  </View>

                  {/* Right content */}
                  <View style={bp.body}>
                    {/* Route section */}
                    <View style={bp.routeSection}>
                      <View style={bp.cityBlock}>
                        <Text style={bp.cityCode}>{getCityCode(trip.departureLocation)}</Text>
                        <Text style={bp.citySub}>{getCityName(trip.departureLocation)}</Text>
                      </View>

                      <View style={bp.routeLineWrap}>
                        <View style={bp.routeDotLeft} />
                        <View style={bp.routeLine} />
                        <View style={bp.routeDotRight} />
                      </View>

                      <View style={bp.cityBlockRight}>
                        <Text style={bp.cityCode}>{getCityCode(trip.destination)}</Text>
                        <Text style={bp.citySub}>{getCityName(trip.destination)}</Text>
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={bp.footer}>
                      <Text style={bp.footerDates}>
                        <Text style={bp.footerDateBold}>{formatDateShort(trip.departureDate)}</Text>
                        {'  →  '}
                        <Text style={bp.footerDateBold}>
                          {trip.returnDate ? formatDateShort(trip.returnDate) : '—'}
                        </Text>
                      </Text>
                      <View style={[bp.badge, daysUntil < 0 && bp.badgePast]}>
                        <Text style={[bp.badgeText, daysUntil < 0 && bp.badgeTextPast]}>{daysLabel}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const bp = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  // Date strip
  dateStrip: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#2C2C2E',
    borderStyle: 'dashed',
  },
  dateMonth: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  dateYear: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  // Body
  body: {
    flex: 1,
  },
  // Route section
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  cityBlock: {},
  cityBlockRight: {
    alignItems: 'flex-end',
  },
  cityCode: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  citySub: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1,
  },
  // Route line with dots
  routeLineWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 6,
  },
  routeDotLeft: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3A3A3C',
  },
  routeDotRight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  // Footer
  footer: {
    backgroundColor: '#161618',
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    borderStyle: 'dashed',
  },
  footerDates: {
    fontSize: 13,
    color: '#8E8E93',
  },
  footerDateBold: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(0,122,255,0.12)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
  },
  badgePast: {
    backgroundColor: 'rgba(142,142,147,0.12)',
  },
  badgeTextPast: {
    color: '#8E8E93',
  },
});

export default TripPlanningTab;
