import React, { useState, useRef, useEffect, useMemo } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "@shared/context/SettingsContext";
import { TravelStackParamList, SerializedTrip } from "@shared/types";
import { EnhancedJetLagService } from "@shared/services/jetlag-brain/enhancedJetLagService";
import { PlanDay, Commitment, FlightTimes } from "@shared/types";
import {
  buildEnhancedTrip,
  TripForPlan,
  getCityUtcOffsetHours,
} from "@shared/services/jetlag-brain/jetLagService";
import {
  estimateCircadianPhase,
  computeAdaptationFactor,
  updateDirectionalEfficiency,
  DEFAULT_EFFICIENCY,
  CircadianEstimate,
  DirectionalEfficiency,
} from "@shared/services/jetlag-brain/circadianModel";
import { useHealthData } from "@shared/context/HealthDataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePersistedState } from "@shared/hooks/usePersistedState";
import {
  getRecentSleepWindow,
  getOvernightHrNadir,
  getOvernightGlucoseNadir,
} from "@shared/services/device/healthKitService";
import { getCityCode } from "../../../cityCodes";
import { s } from "./TripDetailScreen.styles";
import {
  useCommitmentDraft,
  reviveCommitments,
  isHHMM,
} from "./commitmentDraft";
import TripDetailHeader from "./TripDetailHeader";
import TripHealthPage from "./TripHealthPage";
import TripSleepPlanPage from "./TripSleepPlanPage";
import CommitmentSheet from "./CommitmentSheet";
import ReturnFlightModal from "./ReturnFlightModal";

type TripDetailRoute = RouteProp<TravelStackParamList, "TripDetail">;
type TripDetailNav = StackNavigationProp<TravelStackParamList, "TripDetail">;

function deserializeTrip(t: SerializedTrip): TripForPlan {
  return {
    id: t.id,
    departureLocation: t.departureLocation,
    destination: t.destination,
    departureDate: new Date(t.departureDate),
    returnDate: t.returnDate ? new Date(t.returnDate) : undefined,
    timezone: t.timezone,
    originTimezone: t.originTimezone,
    layovers: t.layovers,
    // Route params can carry commitments saved before they had ids.
    commitments: reviveCommitments(t.commitments),
    jetLagPlanner: t.jetLagPlanner,
  };
}

function formatDateRange(dep: Date, ret?: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return ret ? `${fmt(dep)} – ${fmt(ret)}` : fmt(dep);
}

// Action → display config

const TripDetailScreen: React.FC = () => {
  const route = useRoute<TripDetailRoute>();
  const navigation = useNavigation<TripDetailNav>();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { profile } = useHealthData();
  // Rebuilt only when the route param actually changes: this returns a fresh
  // object (with new Date instances) every call, so doing it inline made `trip`
  // a new identity on every render and invalidated everything derived from it.
  const trip = useMemo(
    () => deserializeTrip(route.params.trip),
    [route.params.trip],
  );

  const sleepSchedule = settings?.lifestyle?.sleepSchedule ?? {
    bedTime: "22:00",
    wakeUpTime: "07:00",
  };
  const jl = settings?.travel?.jetLag;
  const jetLagPrefs = jl
    ? {
        chronotype: jl.chronotype,
        planStyle: jl.defaultPlanStyle,
        caffeine: jl.guidanceOptions.caffeine,
        melatonin: jl.guidanceOptions.melatonin,
        naps: jl.guidanceOptions.naps,
      }
    : undefined;

  const settingsSleep = {
    start: sleepSchedule.bedTime,
    end: sleepSchedule.wakeUpTime,
  };
  // Personalised body-clock estimate. Starts from settings, then upgrades to the
  // wearable-derived CBTmin once recent sleep + overnight HR are read (real device).
  const [circadian, setCircadian] = useState<CircadianEstimate>(() =>
    estimateCircadianPhase({ settingsSleep }),
  );
  const [adaptationFactor, setAdaptationFactor] = useState<number>(() =>
    computeAdaptationFactor({ age: profile?.age }),
  );
  useEffect(() => {
    let alive = true;
    (async () => {
      const [measuredSleep, hrNadirLocal, glucoseNadirLocal] =
        await Promise.all([
          getRecentSleepWindow(),
          getOvernightHrNadir(),
          getOvernightGlucoseNadir(),
        ]);
      if (!alive) return;
      setCircadian(
        estimateCircadianPhase({
          settingsSleep,
          measuredSleep,
          hrNadirLocal,
          glucoseNadirLocal,
        }),
      );
      // Refine adaptation speed with measured sleep (chronic sleep debt).
      setAdaptationFactor(
        computeAdaptationFactor({ age: profile?.age, measuredSleep }),
      );
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsSleep.start, settingsSleep.end, profile?.age]);

  // Commitments (meetings etc.) the plan should keep you alert for, and the
  // captured return flight. Both persist per-trip so they survive navigation
  // and app restarts; usePersistedState owns the load-before-write ordering.
  const [commitments, setCommitments] = usePersistedState<Commitment[]>(
    `trip_commitments_${trip.id}`,
    reviveCommitments(trip.commitments),
    reviveCommitments,
  );
  const [returnFlight, setReturnFlight] = usePersistedState<FlightTimes | null>(
    `trip_returnflight_${trip.id}`,
    null,
  );
  const tripForPlan = {
    ...trip,
    commitments,
    returnFlight: returnFlight ?? undefined,
  };

  // Learned per-direction efficiency (persisted across trips).
  const [efficiency, setEfficiency] =
    useState<DirectionalEfficiency>(DEFAULT_EFFICIENCY);
  useEffect(() => {
    AsyncStorage.getItem("jetlag_efficiency")
      .then((raw) => {
        if (raw) {
          try {
            setEfficiency(JSON.parse(raw));
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {});
  }, []);

  // Closed-loop: how many days into the trip are we, and is a live wearable reading
  // available? If so, feed the body's MEASURED phase as `measuredNow` and keep the
  // engine's home baseline from settings (the wearable now reflects the shift, not home).
  const dayOffset = Math.floor(
    (new Date().setHours(0, 0, 0, 0) -
      new Date(trip.departureDate).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  const settingsCbt = `${String((parseInt(settingsSleep.end.slice(0, 2)) + 22) % 24).padStart(2, "0")}:${settingsSleep.end.slice(3)}`; // wake − 2h
  const hasWearable = circadian.source !== "settings";
  const tripOver =
    !!trip.returnDate &&
    dayOffset >
      Math.ceil(
        (new Date(trip.returnDate).getTime() -
          new Date(trip.departureDate).getTime()) /
          86_400_000,
      ) +
        1;
  const useMeasuredNow = dayOffset >= 0 && hasWearable && !tripOver;

  const homeSleep = useMeasuredNow ? settingsSleep : circadian.sleep;
  const homeCbt = useMeasuredNow ? settingsCbt : circadian.cbtMin;
  const planSleep = { bedTime: homeSleep.start, wakeUpTime: homeSleep.end };
  const extras = {
    advanceEfficiency: efficiency.advance,
    delayEfficiency: efficiency.delay,
    measuredNow: useMeasuredNow
      ? { day_offset: dayOffset, cbt_min_local: circadian.cbtMin }
      : undefined,
  };

  const enhancedOutbound = buildEnhancedTrip(
    tripForPlan,
    "outbound",
    planSleep,
    jetLagPrefs,
    homeCbt,
    adaptationFactor,
    undefined,
    extras,
  );
  const hasReturn = !!trip.returnDate;
  // The return leg only needs to undo however much the body actually adapted outbound.
  const outboundAdaptation =
    EnhancedJetLagService.getAchievedAdaptation(enhancedOutbound);
  const enhancedReturn = hasReturn
    ? buildEnhancedTrip(
        tripForPlan,
        "return",
        planSleep,
        jetLagPrefs,
        homeCbt,
        adaptationFactor,
        outboundAdaptation,
        extras,
      )
    : null;
  const outboundPlan: PlanDay[] =
    EnhancedJetLagService.generatePlan(enhancedOutbound);
  const returnPlan: PlanDay[] = enhancedReturn
    ? EnhancedJetLagService.generatePlan(enhancedReturn)
    : [];

  // Learn this user's directional efficiency from the live observation (once per reading).
  useEffect(() => {
    if (!useMeasuredNow) return;
    const rate = EnhancedJetLagService.getObservedShiftRate(enhancedOutbound);
    if (!rate) return;
    setEfficiency((prev) => {
      const next = updateDirectionalEfficiency(
        prev,
        rate.direction,
        rate.observedPerDay,
        rate.expectedPerDay,
      );
      AsyncStorage.setItem("jetlag_efficiency", JSON.stringify(next)).catch(
        () => {},
      );
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMeasuredNow, circadian.cbtMin, dayOffset]);

  const [leg, setLeg] = useState<"outbound" | "return">("outbound");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [sectionTab, setSectionTab] = useState<"sleep" | "health">("sleep");
  const pagerRef = useRef<PagerView>(null);

  const planDays = leg === "return" ? returnPlan : outboundPlan;
  const switchLeg = (next: "outbound" | "return") => {
    setLeg(next);
    setSelectedDayIdx(0);
  };

  // The add/edit-commitment form owns its own fields and validation.
  const commitDraft = useCommitmentDraft(planDays);
  const saveCommitment = () => {
    const next = commitDraft.commit();
    if (!next) return;
    setCommitments((prev) =>
      prev.some((c) => c.id === next.id)
        ? prev.map((c) => (c.id === next.id ? next : c))
        : [...prev, next],
    );
    commitDraft.close();
  };

  // Commitments are date-stamped, so only show the ones falling on a day of the
  // leg currently on screen — otherwise the return leg lists outbound meetings
  // it has no day to map them onto.
  const legCommitments = useMemo(() => {
    const dates = new Set(planDays.map((d) => d.date_local));
    return commitments.filter((c) => dates.has(c.date_local));
  }, [commitments, planDays]);

  // Return-flight capture form.
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [draftRetDep, setDraftRetDep] = useState(
    returnFlight?.departureTime ?? "12:00",
  );
  const [draftRetArr, setDraftRetArr] = useState(
    returnFlight?.arrivalTime ?? "16:00",
  );
  const saveReturnFlight = () => {
    if (!isHHMM(draftRetDep) || !isHHMM(draftRetArr)) return;
    setReturnFlight({ departureTime: draftRetDep, arrivalTime: draftRetArr });
    setShowReturnForm(false);
  };

  const switchSection = (tab: "sleep" | "health") => {
    setSectionTab(tab);
    pagerRef.current?.setPage(tab === "sleep" ? 0 : 1);
  };
  const depCode = getCityCode(trip.departureLocation);
  const destCode = getCityCode(trip.destination);

  const originOffset = getCityUtcOffsetHours(trip.departureLocation) ?? 0;
  const destOffset = getCityUtcOffsetHours(trip.destination) ?? 0;
  const tzDiff = destOffset - originOffset;
  const tzLabel = `+${Math.abs(tzDiff)}h ${tzDiff >= 0 ? "East" : "West"}`;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <TripDetailHeader
        depCode={depCode}
        destCode={destCode}
        dateRange={formatDateRange(trip.departureDate, trip.returnDate)}
        tzLabel={tzLabel}
        sectionTab={sectionTab}
        onSelectSection={switchSection}
        onBack={() => navigation.goBack()}
      />

      {/* Swipeable pages */}
      <PagerView
        ref={pagerRef}
        style={s.pager}
        initialPage={0}
        scrollEnabled={false}
        onPageSelected={(e) => {
          setSectionTab(e.nativeEvent.position === 0 ? "sleep" : "health");
        }}
      >
        {/* Page 0: Sleep Plan */}
        <TripSleepPlanPage
          key="plan"
          planDays={planDays}
          selectedDayIdx={selectedDayIdx}
          setSelectedDayIdx={setSelectedDayIdx}
          depCode={depCode}
          destCode={destCode}
          hasReturn={hasReturn}
          leg={leg}
          switchLeg={switchLeg}
          returnFlight={returnFlight}
          commitments={legCommitments}
          onRemoveCommitment={(c) =>
            setCommitments((prev) => prev.filter((x) => x.id !== c.id))
          }
          onShowReturnForm={() => {
            setDraftRetDep(returnFlight?.departureTime ?? "12:00");
            setDraftRetArr(returnFlight?.arrivalTime ?? "16:00");
            setShowReturnForm(true);
          }}
          onAddCommitment={commitDraft.openAdd}
          onEditCommitment={commitDraft.openEdit}
        />

        {/* Page 1: Travel Health */}
        <TripHealthPage key="health" />
      </PagerView>

      <CommitmentSheet
        draft={commitDraft}
        planDays={planDays}
        bottomInset={insets.bottom}
        onSave={saveCommitment}
      />

      <ReturnFlightModal
        visible={showReturnForm}
        depCode={depCode}
        destCode={destCode}
        draftRetDep={draftRetDep}
        draftRetArr={draftRetArr}
        setDraftRetDep={setDraftRetDep}
        setDraftRetArr={setDraftRetArr}
        returnFlight={returnFlight}
        setReturnFlight={setReturnFlight}
        onClose={() => setShowReturnForm(false)}
        onSave={saveReturnFlight}
      />
    </View>
  );
};

export default TripDetailScreen;
