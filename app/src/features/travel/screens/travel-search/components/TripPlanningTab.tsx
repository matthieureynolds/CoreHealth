import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  RootStackParamList,
  TravelStackParamList,
  SerializedTrip,
} from "@shared/types";
import { styles } from "../TravelScreen.styles";
import PressPop from "./PressPop";
import { palette } from "@shared/theme/colors";
import { getCityCode, getCityName } from "../../../cityCodes";

type Nav = CompositeNavigationProp<
  StackNavigationProp<TravelStackParamList, "TravelList">,
  StackNavigationProp<RootStackParamList>
>;

interface Trip {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  originTimezone?: string;
  layovers?: Array<{
    city?: string;
    tz: string;
    arr_local: string;
    dep_local: string;
  }>;
  notes?: string;
  /** Opaque engine output; shape owned by jetlag-brain, never read here. */
  jetLagData?: unknown;
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
      direction: "outbound";
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
    returnPlan?: {
      direction: "return";
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
    originTimezone: t.originTimezone,
    layovers: t.layovers,
    notes: t.notes,
    jetLagPlanner: t.jetLagPlanner,
  };
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function formatDay(date: Date): string {
  return date.getDate().toString();
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onScrollOffset?: (offsetY: number) => void;
}

// Memoised: this tab is mounted inside the pager at all times, so without it
// every keystroke in the search tab re-rendered the whole trip list.
const TripPlanningTab: React.FC<TripPlanningTabProps> = React.memo(
  ({
    trips,
    tripModalTranslateY,
    onOpenAddTrip,
    onEditTrip,
    onDeleteTrip,
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
      (a, b) => a.departureDate.getTime() - b.departureDate.getTime(),
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
              <Ionicons
                name="airplane"
                size={48}
                color={palette.textSecondary}
              />
              <Text style={styles.emptyStateTitle}>No trips planned</Text>
              <Text style={styles.emptyStateText}>
                Add your first trip to get personalized health recommendations
              </Text>
              <TouchableOpacity
                style={styles.addTripButton}
                onPress={handleOpenAddTrip}
              >
                <Ionicons name="add" size={24} color={palette.textPrimary} />
                <Text style={styles.addTripButtonText}>Add a Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tripsContainer}>
              {sortedTrips.map((trip) => {
                const daysUntil = getDaysUntil(trip.departureDate);
                const daysLabel =
                  daysUntil === 0
                    ? "Today"
                    : daysUntil === 1
                      ? "1 day"
                      : daysUntil < 0
                        ? "Past"
                        : `${daysUntil} days`;

                return (
                  <Swipeable
                    key={trip.id}
                    friction={2}
                    rightThreshold={40}
                    containerStyle={bp.swipeContainer}
                    renderRightActions={() => (
                      <View style={bp.swipeActions}>
                        <RectButton
                          style={[bp.swipeAction, bp.editAction]}
                          onPress={() => onEditTrip(trip)}
                        >
                          <Ionicons
                            name="pencil"
                            size={20}
                            color={palette.textPrimary}
                          />
                          <Text style={bp.swipeActionText}>Edit</Text>
                        </RectButton>
                        <RectButton
                          style={[bp.swipeAction, bp.removeAction]}
                          onPress={() => onDeleteTrip(trip.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={palette.textPrimary}
                          />
                          <Text style={bp.swipeActionText}>Remove</Text>
                        </RectButton>
                      </View>
                    )}
                  >
                    <PressPop
                      style={bp.card}
                      onPress={() =>
                        navigation.navigate("TripDetail", {
                          trip: serializeTrip(trip),
                        })
                      }
                      activeOpacity={1}
                    >
                      {/* Left date strip */}
                      <View style={bp.dateStrip}>
                        <Text style={bp.dateMonth}>
                          {formatMonth(trip.departureDate)}
                        </Text>
                        <Text style={bp.dateDay}>
                          {formatDay(trip.departureDate)}
                        </Text>
                        <Text style={bp.dateYear}>
                          {trip.departureDate.getFullYear()}
                        </Text>
                      </View>

                      {/* Right content */}
                      <View style={bp.body}>
                        {/* Route section */}
                        <View style={bp.routeSection}>
                          <View style={bp.cityBlock}>
                            <Text style={bp.cityCode}>
                              {getCityCode(trip.departureLocation)}
                            </Text>
                            <Text style={bp.citySub}>
                              {getCityName(trip.departureLocation)}
                            </Text>
                          </View>

                          <View style={bp.routeLineWrap}>
                            <View style={bp.routeDotLeft} />
                            <View style={bp.routeLine} />
                            <View style={bp.routeDotRight} />
                          </View>

                          <View style={bp.cityBlockRight}>
                            <Text style={bp.cityCode}>
                              {getCityCode(trip.destination)}
                            </Text>
                            <Text style={bp.citySub}>
                              {getCityName(trip.destination)}
                            </Text>
                          </View>
                        </View>

                        {/* Footer */}
                        <View style={bp.footer}>
                          <Text style={bp.footerDates}>
                            <Text style={bp.footerDateBold}>
                              {formatDateShort(trip.departureDate)}
                            </Text>
                            {"  →  "}
                            <Text style={bp.footerDateBold}>
                              {trip.returnDate
                                ? formatDateShort(trip.returnDate)
                                : "—"}
                            </Text>
                          </Text>
                          <View
                            style={[bp.badge, daysUntil < 0 && bp.badgePast]}
                          >
                            <Text
                              style={[
                                bp.badgeText,
                                daysUntil < 0 && bp.badgeTextPast,
                              ]}
                            >
                              {daysLabel}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </PressPop>
                  </Swipeable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    );
  },
);

TripPlanningTab.displayName = "TripPlanningTab";

const bp = StyleSheet.create({
  swipeContainer: {
    marginBottom: 14,
    borderRadius: 16,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    paddingLeft: 8,
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 16,
  },
  editAction: { backgroundColor: palette.warning },
  removeAction: { backgroundColor: palette.danger },
  swipeActionText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  // Date strip
  dateStrip: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: palette.surfaceElevated,
    borderStyle: "dashed",
  },
  dateMonth: {
    fontSize: 11,
    color: palette.accent,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 26,
    fontWeight: "800",
    color: palette.textPrimary,
    lineHeight: 30,
  },
  dateYear: {
    fontSize: 10,
    color: palette.textSecondary,
    marginTop: 2,
  },
  // Body
  body: {
    flex: 1,
  },
  // Route section
  routeSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  cityBlock: {},
  cityBlockRight: {
    alignItems: "flex-end",
  },
  cityCode: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.textPrimary,
    letterSpacing: 1,
  },
  citySub: {
    fontSize: 10,
    color: palette.textSecondary,
    marginTop: 1,
  },
  // Route line with dots
  routeLineWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 6,
  },
  routeDotLeft: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  routeDotRight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent,
  },
  // Footer
  footer: {
    backgroundColor: palette.surfaceNear,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: palette.surfaceElevated,
    borderStyle: "dashed",
  },
  footerDates: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  footerDateBold: {
    color: palette.textPrimary,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "rgba(0,122,255,0.12)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: palette.accent,
  },
  badgePast: {
    backgroundColor: "rgba(142,142,147,0.12)",
  },
  badgeTextPast: {
    color: palette.textSecondary,
  },
});

export default TripPlanningTab;
