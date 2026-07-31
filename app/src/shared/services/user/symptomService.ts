import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  SymptomEntry,
  StateOfMindEntry,
  SymptomStats,
  StateOfMindChartData,
  QuickLogData,
} from "../../types/symptoms";
import { api } from "../data/apiClient";

const SYMPTOMS_STORAGE_KEY = "symptom_entries";
const STATE_OF_MIND_STORAGE_KEY = "state_of_mind_entries";

export class SymptomService {
  private static instance: SymptomService;
  private symptoms: SymptomEntry[] = [];
  private stateOfMind: StateOfMindEntry[] = [];

  static getInstance(): SymptomService {
    if (!SymptomService.instance) {
      SymptomService.instance = new SymptomService();
    }
    return SymptomService.instance;
  }

  async initialize() {
    await this.loadSymptoms();
    await this.loadStateOfMind();
  }

  private async loadSymptoms() {
    try {
      const stored = await AsyncStorage.getItem(SYMPTOMS_STORAGE_KEY);
      this.symptoms = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading symptoms:", error);
      this.symptoms = [];
    }
  }

  private async loadStateOfMind() {
    try {
      const stored = await AsyncStorage.getItem(STATE_OF_MIND_STORAGE_KEY);
      this.stateOfMind = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading state of mind:", error);
      this.stateOfMind = [];
    }
  }

  private async saveSymptoms() {
    try {
      await AsyncStorage.setItem(
        SYMPTOMS_STORAGE_KEY,
        JSON.stringify(this.symptoms),
      );
    } catch (error) {
      console.error("Error saving symptoms:", error);
    }
  }

  private async saveStateOfMind() {
    try {
      await AsyncStorage.setItem(
        STATE_OF_MIND_STORAGE_KEY,
        JSON.stringify(this.stateOfMind),
      );
    } catch (error) {
      console.error("Error saving state of mind:", error);
    }
  }

  async logSymptom(
    symptomData: Omit<SymptomEntry, "id" | "timestamp">,
  ): Promise<SymptomEntry> {
    const symptom: SymptomEntry = {
      ...symptomData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    this.symptoms.push(symptom);
    await this.saveSymptoms();

    // Sync to backend so Toto knows about symptoms (fire-and-forget)
    fetchAuthSession()
      .then((session) => {
        const userId = session.tokens?.idToken?.payload?.sub as
          | string
          | undefined;
        if (userId) {
          api
            .post(`/users/${userId}/symptoms`, {
              type: symptom.type,
              category: symptom.category,
              severity: symptom.severity,
              duration: symptom.duration,
              location: symptom.location,
              notes: symptom.notes,
              medications: symptom.medications,
              factors: symptom.factors,
              loggedAt: symptom.timestamp,
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    return symptom;
  }

  async logStateOfMind(
    stateData: Omit<StateOfMindEntry, "id" | "timestamp">,
  ): Promise<StateOfMindEntry> {
    const state: StateOfMindEntry = {
      ...stateData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    this.stateOfMind.push(state);
    await this.saveStateOfMind();
    return state;
  }

  async quickLog(quickData: QuickLogData): Promise<SymptomEntry> {
    const symptomData = {
      type: quickData.type,
      category: quickData.category,
      severity: quickData.severity,
      duration: quickData.duration as any,
      location: quickData.location,
      notes: quickData.notes,
      factors: quickData.factors,
    };

    return this.logSymptom(symptomData);
  }

  async getSymptoms(limit?: number): Promise<SymptomEntry[]> {
    await this.loadSymptoms();
    const sorted = this.symptoms.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async getStateOfMind(limit?: number): Promise<StateOfMindEntry[]> {
    await this.loadStateOfMind();
    const sorted = this.stateOfMind.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async getSymptomStats(): Promise<SymptomStats> {
    await this.loadSymptoms();

    const totalEntries = this.symptoms.length;
    const physicalEntries = this.symptoms.filter(
      (s) => s.type === "physical",
    ).length;
    const mentalEntries = this.symptoms.filter(
      (s) => s.type === "mental",
    ).length;

    // Most common symptom
    const symptomCounts: { [key: string]: number } = {};
    this.symptoms.forEach((symptom) => {
      symptomCounts[symptom.category] =
        (symptomCounts[symptom.category] || 0) + 1;
    });
    const mostCommonSymptom = Object.keys(symptomCounts).reduce(
      (a, b) => (symptomCounts[a] > symptomCounts[b] ? a : b),
      "None",
    );

    // Average severity
    const averageSeverity =
      this.symptoms.length > 0
        ? this.symptoms.reduce((sum, s) => sum + s.severity, 0) /
          this.symptoms.length
        : 0;

    // Mood trend (based on recent state of mind entries)
    await this.loadStateOfMind();
    const recentMoods = this.stateOfMind.slice(0, 7).map((s) => s.mood);
    let moodTrend: "improving" | "stable" | "declining" = "stable";
    if (recentMoods.length >= 2) {
      const firstHalf = recentMoods.slice(
        0,
        Math.floor(recentMoods.length / 2),
      );
      const secondHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
      const firstAvg =
        firstHalf.reduce((sum, m) => sum + m, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, m) => sum + m, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.5) moodTrend = "improving";
      else if (secondAvg < firstAvg - 0.5) moodTrend = "declining";
    }

    return {
      totalEntries,
      physicalEntries,
      mentalEntries,
      mostCommonSymptom,
      averageSeverity,
      symptomFrequency: symptomCounts,
      moodTrend,
      lastEntry: this.symptoms.length > 0 ? this.symptoms[0].timestamp : "",
    };
  }

  async getStateOfMindChartData(
    period: "weekly" | "monthly" | "6months" | "yearly",
  ): Promise<StateOfMindChartData> {
    await this.loadStateOfMind();
    await this.loadSymptoms();

    const now = new Date();
    let startDate: Date;
    let daysBack: number;

    switch (period) {
      case "weekly":
        daysBack = 7;
        startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        daysBack = 30;
        startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        break;
      case "6months":
        daysBack = 180;
        startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        break;
      case "yearly":
        daysBack = 365;
        startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        break;
    }

    // Filter data by period
    const filteredStateOfMind = this.stateOfMind.filter(
      (entry) => new Date(entry.timestamp) >= startDate,
    );

    const filteredSymptoms = this.symptoms.filter(
      (entry) => new Date(entry.timestamp) >= startDate,
    );

    // Group by date
    const dataByDate: {
      [key: string]: {
        mood: number[];
        energy: number[];
        stress: number[];
        symptoms: number;
      };
    } = {};

    filteredStateOfMind.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      if (!dataByDate[date]) {
        dataByDate[date] = { mood: [], energy: [], stress: [], symptoms: 0 };
      }
      dataByDate[date].mood.push(entry.mood);
      dataByDate[date].energy.push(entry.energy);
      dataByDate[date].stress.push(entry.stress);
    });

    filteredSymptoms.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      if (!dataByDate[date]) {
        dataByDate[date] = { mood: [], energy: [], stress: [], symptoms: 0 };
      }
      dataByDate[date].symptoms += 1;
    });

    // Convert to chart data
    const data = Object.keys(dataByDate)
      .map((date) => {
        const dayData = dataByDate[date];
        return {
          date,
          mood:
            dayData.mood.length > 0
              ? dayData.mood.reduce((sum, m) => sum + m, 0) /
                dayData.mood.length
              : 5,
          energy:
            dayData.energy.length > 0
              ? dayData.energy.reduce((sum, e) => sum + e, 0) /
                dayData.energy.length
              : 5,
          stress:
            dayData.stress.length > 0
              ? dayData.stress.reduce((sum, s) => sum + s, 0) /
                dayData.stress.length
              : 5,
          symptoms: dayData.symptoms,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate average mood
    const averageMood =
      data.length > 0
        ? data.reduce((sum, d) => sum + d.mood, 0) / data.length
        : 5;

    // Calculate trend
    let trend: "up" | "down" | "stable" = "stable";
    if (data.length >= 2) {
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      const firstAvg =
        firstHalf.reduce((sum, d) => sum + d.mood, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, d) => sum + d.mood, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.3) trend = "up";
      else if (secondAvg < firstAvg - 0.3) trend = "down";
    }

    // Generate insights
    const insights: string[] = [];
    if (trend === "up") insights.push("Your mood has been improving recently");
    else if (trend === "down")
      insights.push("Your mood has been declining recently");

    const highSymptomDays = data.filter((d) => d.symptoms > 3).length;
    if (highSymptomDays > data.length * 0.3) {
      insights.push("You've been logging more symptoms than usual");
    }

    return {
      period,
      data,
      averageMood,
      trend,
      insights,
    };
  }

  async deleteSymptom(symptomId: string): Promise<void> {
    this.symptoms = this.symptoms.filter((s) => s.id !== symptomId);
    await this.saveSymptoms();
  }

  async deleteStateOfMind(entryId: string): Promise<void> {
    this.stateOfMind = this.stateOfMind.filter((s) => s.id !== entryId);
    await this.saveStateOfMind();
  }

  async clearAllData(): Promise<void> {
    this.symptoms = [];
    this.stateOfMind = [];
    await this.saveSymptoms();
    await this.saveStateOfMind();
  }
}

export const symptomService = SymptomService.getInstance();
