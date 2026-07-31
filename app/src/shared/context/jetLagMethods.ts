import AsyncStorage from "@react-native-async-storage/async-storage";
import { JetLagPlanningEvent } from "../types";

export async function addJetLagPlanningEvent(
  event: Omit<JetLagPlanningEvent, "id" | "createdAt" | "updatedAt">,
  jetLagPlanningEvents: JetLagPlanningEvent[],
  setJetLagPlanningEvents: (events: JetLagPlanningEvent[]) => void,
): Promise<void> {
  const newEvent: JetLagPlanningEvent = {
    ...event,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedEvents = [...jetLagPlanningEvents, newEvent];
  setJetLagPlanningEvents(updatedEvents);
  await AsyncStorage.setItem(
    "jetLagPlanningEvents",
    JSON.stringify(updatedEvents),
  );
}

export async function updateJetLagPlanningEvent(
  id: string,
  updates: Partial<JetLagPlanningEvent>,
  jetLagPlanningEvents: JetLagPlanningEvent[],
  setJetLagPlanningEvents: (events: JetLagPlanningEvent[]) => void,
): Promise<void> {
  const updatedEvents = jetLagPlanningEvents.map((event) =>
    event.id === id
      ? { ...event, ...updates, updatedAt: new Date().toISOString() }
      : event,
  );
  setJetLagPlanningEvents(updatedEvents);
  await AsyncStorage.setItem(
    "jetLagPlanningEvents",
    JSON.stringify(updatedEvents),
  );
}

export async function deleteJetLagPlanningEvent(
  id: string,
  jetLagPlanningEvents: JetLagPlanningEvent[],
  setJetLagPlanningEvents: (events: JetLagPlanningEvent[]) => void,
): Promise<void> {
  const updatedEvents = jetLagPlanningEvents.filter((event) => event.id !== id);
  setJetLagPlanningEvents(updatedEvents);
  await AsyncStorage.setItem(
    "jetLagPlanningEvents",
    JSON.stringify(updatedEvents),
  );
}

export function getUpcomingJetLagEvents(
  jetLagPlanningEvents: JetLagPlanningEvent[],
): JetLagPlanningEvent[] {
  const now = new Date();
  return jetLagPlanningEvents
    .filter((event) => new Date(event.departureDate) > now)
    .sort(
      (a, b) =>
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime(),
    );
}
