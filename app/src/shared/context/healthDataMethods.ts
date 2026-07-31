import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadStoredHealthData } from "./healthDataLoader";
import { bootstrapHealthData } from "./healthDataBootstrap";
import { DEFAULT_PROFILE } from "./healthDataLoader";
import { DataService } from "../services/data/dataService";
import {
  UserProfile,
  Biomarker,
  LabResult,
  DeviceData,
  DailyInsight,
  HealthScore,
  BodySystem,
  JetLagPlanningEvent,
} from "../types";

// ── Body system builder ───────────────────────────────────────────────────────
// Maps biomarker categories + imaging modalities/impressions to body systems,
// computing a riskScore (0–100, higher = more concerning) for each.

const BODY_SYSTEM_DEFS: Array<{
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  biomarkerCategories: string[];
  imagingModalities: string[];
  impressionKeywords: RegExp;
}> = [
  {
    id: "cardiovascular",
    name: "Cardiovascular",
    coordinates: { x: 50, y: 30 },
    biomarkerCategories: ["cardiovascular"],
    imagingModalities: ["ecg", "echo", "x-ray"],
    impressionKeywords:
      /cardiac|heart|coronary|arrhythmia|cardiomegaly|atrial|ventricular|aorta|valve/i,
  },
  {
    id: "metabolic",
    name: "Metabolic",
    coordinates: { x: 50, y: 45 },
    biomarkerCategories: ["metabolic"],
    imagingModalities: ["ultrasound", "ct"],
    impressionKeywords:
      /liver|pancreas|glucose|insulin|thyroid|metabolic|fatty|hepat/i,
  },
  {
    id: "hormonal",
    name: "Hormonal",
    coordinates: { x: 60, y: 40 },
    biomarkerCategories: ["hormonal"],
    imagingModalities: ["ultrasound", "mri"],
    impressionKeywords:
      /thyroid|adrenal|pituitary|ovarian|testicular|hormone|endocrine/i,
  },
  {
    id: "inflammatory",
    name: "Inflammatory",
    coordinates: { x: 40, y: 35 },
    biomarkerCategories: ["inflammatory"],
    imagingModalities: [],
    impressionKeywords: /inflammation|autoimmune|arthritis|synovitis/i,
  },
  {
    id: "nutritional",
    name: "Nutritional",
    coordinates: { x: 55, y: 50 },
    biomarkerCategories: ["nutritional"],
    imagingModalities: ["dexa"],
    impressionKeywords: /osteoporosis|osteopenia|bone density|deficiency/i,
  },
  {
    id: "neurological",
    name: "Neurological",
    coordinates: { x: 50, y: 10 },
    biomarkerCategories: [],
    imagingModalities: ["mri", "ct", "pet"],
    impressionKeywords:
      /brain|neuro|cognitive|cerebral|cortex|white matter|lesion|stroke/i,
  },
  {
    id: "respiratory",
    name: "Respiratory",
    coordinates: { x: 50, y: 25 },
    biomarkerCategories: [],
    imagingModalities: ["x-ray", "ct"],
    impressionKeywords:
      /lung|pulmonary|bronch|pneumon|pleural|effusion|airway/i,
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal",
    coordinates: { x: 50, y: 60 },
    biomarkerCategories: [],
    imagingModalities: ["x-ray", "mri", "dexa"],
    impressionKeywords:
      /bone|joint|fracture|osteoporosis|tendon|ligament|cartilage|spine|disc/i,
  },
];

const CONCERNING =
  /abnormal|severe|significant|stenosis|cardiomegaly|arrhythmia|osteoporosis|effusion|fracture|mass|lesion|malignant|critical/i;
const MILD = /mild|borderline|minimal|slight/i;

function imagingRiskForSystem(
  def: (typeof BODY_SYSTEM_DEFS)[0],
  imagingResults: any[],
): number {
  return imagingResults.reduce((risk: number, img: any) => {
    const modalityMatch = def.imagingModalities.includes(img.modality);
    const text = img.impression || img.findings || "";
    const keywordMatch = def.impressionKeywords.test(text);
    if (!modalityMatch && !keywordMatch) return risk;
    if (CONCERNING.test(text)) return risk + 20;
    if (MILD.test(text)) return risk + 8;
    // Matched modality/keyword but no concerning language — small baseline
    return risk + 2;
  }, 0);
}

function buildBodySystemsFromData(
  biomarkers: Biomarker[],
  imagingResults: any[],
): BodySystem[] {
  return BODY_SYSTEM_DEFS.map((def) => {
    const systemBiomarkers = biomarkers.filter((b) =>
      def.biomarkerCategories.includes(b.category),
    );
    const abnormalCount = systemBiomarkers.filter(
      (b) => b.riskLevel === "high" || b.riskLevel === "medium",
    ).length;

    const biomarkerRisk =
      systemBiomarkers.length > 0
        ? Math.round((abnormalCount / systemBiomarkers.length) * 60)
        : 0;

    const imgRisk = imagingRiskForSystem(def, imagingResults);
    const riskScore = Math.min(95, biomarkerRisk + imgRisk);

    return {
      id: def.id,
      name: def.name,
      coordinates: def.coordinates,
      biomarkers: systemBiomarkers,
      riskScore,
      lastAssessment: new Date(),
    };
  }).filter((s) => s.biomarkers.length > 0 || s.riskScore > 0);
  // Only show systems that have data — avoids empty systems cluttering the body map
}

function mapDeviceNameToType(name: string): DeviceData["deviceType"] {
  const n = (name || "").toLowerCase();
  if (n.includes("whoop")) return "whoop";
  if (n.includes("apple")) return "apple_watch";
  if (n.includes("eight sleep") || n.includes("8 sleep")) return "eight_sleep";
  if (n.includes("toothbrush")) return "smart_toothbrush";
  if (n.includes("u-scan") || n.includes("u scan") || n.includes("toilet"))
    return "smart_toilet";
  return "apple_watch";
}

interface LoadHealthDataSetters {
  setProfile: (v: UserProfile | null) => void;
  setBiomarkers: (v: Biomarker[]) => void;
  setLabResults: (v: LabResult[]) => void;
  setDeviceData: (fn: (prev: DeviceData[]) => DeviceData[]) => void;
  setDeviceDataDirect: (v: DeviceData[]) => void;
  setDailyInsights: (v: DailyInsight[]) => void;
  setHealthScore: (v: HealthScore) => void;
  setHealthScoreCalculated: (v: boolean) => void;
  setOriginTimezoneState: (v: string) => void;
  setOriginLocationState: (v: string) => void;
  setJetLagPlanningEvents: (v: JetLagPlanningEvent[]) => void;
  setBodySystems: (v: BodySystem[]) => void;
  setIsLoading: (v: boolean) => void;
}

export const loadHealthData = async (
  setters: LoadHealthDataSetters,
  userId?: string,
): Promise<void> => {
  try {
    // ── Local preferences (jet lag, timezone, connected devices) ─────────────
    const stored = await loadStoredHealthData();
    if (stored.originTimezone)
      setters.setOriginTimezoneState(stored.originTimezone);
    if (stored.originLocation)
      setters.setOriginLocationState(stored.originLocation);
    setters.setJetLagPlanningEvents(stored.jetLagPlanningEvents);

    if (stored.connectedDevices) {
      const mapped: DeviceData[] = stored.connectedDevices
        .filter((d: any) => /connected/i.test(d.status || ""))
        .map((d: any, idx: number) => ({
          id: `conn-${idx}`,
          deviceType: mapDeviceNameToType(d.name),
          timestamp: new Date(),
          metrics: {},
        }));
      if (mapped.length) {
        setters.setDeviceData((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          ...mapped,
        ]);
      }
    }

    // ── Health data from API ──────────────────────────────────────────────────
    if (userId) {
      const [
        biomarkers,
        allergies,
        profileRow,
        medications,
        conditions,
        vaccinations,
        imagingResults,
      ] = await Promise.all([
        DataService.getBiomarkers(),
        DataService.getAllergies(userId).catch(() => []),
        DataService.getProfile(userId).catch(() => null),
        DataService.getMedications(userId).catch(() => []),
        DataService.getConditions(userId).catch(() => []),
        DataService.getVaccinations(userId).catch(() => []),
        DataService.getImagingResults().catch(() => []),
      ]);
      setters.setBiomarkers(biomarkers);

      // Build profile from DB data, merging in allergies/medications/conditions/vaccinations
      const dbProfile: any = profileRow ?? {};
      const age = dbProfile.date_of_birth
        ? Math.floor(
            (Date.now() - new Date(dbProfile.date_of_birth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : DEFAULT_PROFILE.age;

      const mappedMedications = medications.map((m: any) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage ?? undefined,
        frequency: m.frequency ?? undefined,
        startDate: m.start_date ?? undefined,
        endDate: m.end_date ?? undefined,
        notes: m.notes ?? undefined,
      }));

      const mappedConditions = conditions.map((c: any) => ({
        id: c.id,
        condition: c.name,
        severity: (c.severity ?? "mild") as "mild" | "moderate" | "severe",
        status: (c.status ?? "active") as "active" | "resolved" | "managed",
        diagnosedDate: c.diagnosed_date ?? new Date().toISOString(),
        resolvedDate: c.resolved_date ?? undefined,
        notes: c.notes ?? undefined,
      }));

      const mappedVaccinations = vaccinations.map((v: any) => ({
        id: v.id,
        name: v.name,
        date: new Date(v.date),
        nextDue: v.next_due ? new Date(v.next_due) : undefined,
        location: v.location ?? undefined,
        batchNumber: v.batch_number ?? undefined,
        notes: v.notes ?? undefined,
      }));

      setters.setProfile({
        ...DEFAULT_PROFILE,
        userId,
        age,
        gender: (dbProfile.gender ??
          DEFAULT_PROFILE.gender) as UserProfile["gender"],
        height: dbProfile.height_cm ?? DEFAULT_PROFILE.height,
        weight: dbProfile.weight_kg ?? DEFAULT_PROFILE.weight,
        birthDate: dbProfile.date_of_birth ?? undefined,
        ethnicity: dbProfile.ethnicity ?? undefined,
        allergies,
        medications: mappedMedications,
        medicalHistory: mappedConditions,
        vaccinations: mappedVaccinations,
      } as UserProfile);

      // New user with no data — show bootstrap insights/score only (not fake biomarkers)
      if (biomarkers.length === 0 && imagingResults.length === 0) {
        const bootstrapped = await bootstrapHealthData();
        setters.setHealthScore(bootstrapped.healthScore);
        setters.setDailyInsights(bootstrapped.insights);
        setters.setBodySystems(bootstrapped.bodySystems);
        setters.setHealthScoreCalculated(true);
      } else {
        // ── Health score ────────────────────────────────────────────────────────
        const normalCount = biomarkers.filter(
          (b) => b.riskLevel === "low",
        ).length;
        const biomarkerScore =
          biomarkers.length > 0
            ? Math.round((normalCount / biomarkers.length) * 100)
            : 80;
        const clampedBiomarkerScore = Math.max(
          40,
          Math.min(100, biomarkerScore),
        );

        // Imaging penalty: each concerning finding reduces the score (max −20)
        const SIGNIFICANT =
          /abnormal|osteoporosis|stenosis|arrhythmia|cardiomegaly|effusion|fracture|mass|lesion|malignant|severe|significant/i;
        const MILD_CONCERN = /mild|borderline|minimal|slight/i;
        const imagingPenalty = Math.min(
          20,
          imagingResults.reduce((pen: number, img: any) => {
            const text = img.impression || img.findings || "";
            if (SIGNIFICANT.test(text)) return pen + 5;
            if (MILD_CONCERN.test(text)) return pen + 2;
            return pen;
          }, 0),
        );

        const overall = Math.max(40, clampedBiomarkerScore - imagingPenalty);
        setters.setHealthScore({
          overall,
          biomarkers: overall,
          activity: 75,
          recovery: 75,
          nutrition: 75,
          sleep: 75,
          stress: 75,
        });
        setters.setHealthScoreCalculated(true);

        // ── Body systems ────────────────────────────────────────────────────────
        setters.setBodySystems(
          buildBodySystemsFromData(biomarkers, imagingResults),
        );
      }

      try {
        await AsyncStorage.setItem(
          "@corehealth_last_sync_at",
          new Date().toISOString(),
        );
      } catch (e) {
        /* non-critical */
      }
    } else {
      // Not yet authenticated — use local cache if available, otherwise bootstrap
      if (stored.biomarkers) setters.setBiomarkers(stored.biomarkers);
      if (stored.labResults) setters.setLabResults(stored.labResults);
      if (stored.healthScore) {
        setters.setHealthScore(stored.healthScore);
        setters.setHealthScoreCalculated(true);
      } else {
        const bootstrapped = await bootstrapHealthData();
        setters.setHealthScore(bootstrapped.healthScore);
        setters.setDailyInsights(bootstrapped.insights);
        setters.setBodySystems(bootstrapped.bodySystems);
        setters.setHealthScoreCalculated(true);
      }
    }
  } catch (error) {
    console.error("Failed to load health data:", error);
    try {
      const bootstrapped = await bootstrapHealthData();
      setters.setHealthScore(bootstrapped.healthScore);
      setters.setDailyInsights(bootstrapped.insights);
      setters.setBodySystems(bootstrapped.bodySystems);
      setters.setHealthScoreCalculated(true);
    } catch (e) {
      /* ignore bootstrap failure */
    }
  } finally {
    setters.setIsLoading(false);
  }
};
