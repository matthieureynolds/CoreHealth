/**
 * The trip domain type.
 *
 * Lived in useTripHandlers and was re-exported through useTravelHandlers, which
 * made useTravelState -> useTravelHandlers -> useTravelState a cycle just to
 * reach a type. A type belongs in a module that imports nothing.
 */
export interface Trip {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  /** IANA tz of the departure airport (e.g. 'Europe/London'). Set for flight-created trips. */
  originTimezone?: string;
  /** Connecting-flight layovers (between segments). */
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
