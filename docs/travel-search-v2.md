# Travel Search — v2 Plan

> Status: planning. v1 ships with **static mock data** for all metrics and
> hospitals. v2 makes travel search real, location-aware, time-aware, and
> personalised to the user's own health profile.

## The v1 gap (what's currently fake)
- **Health metrics** (`travelMetricHelpers.ts` → `HEALTH_METRIC_ROWS`) are
  hardcoded constants. Air Quality is always "Moderate", Water always "Safe",
  etc. — they do not change with the searched location.
- **Nearby hospitals** (`NearbyHospitalsSection.tsx`) are 4 hardcoded entries
  with fixed distances. Same regardless of location.
- Explanations / recommendations are static lookup text per status.

## v2 scope

### 1. Real, location-aware data
Wire the 7 metrics to live APIs per searched destination:
- Air Quality (Google Air Quality / IQAir)
- UV Index (OpenUV)
- Pollen (Google Pollen)
- Water & food safety, disease outbreaks (WHO / CDC travel feeds)
- Altitude (elevation API)
- Real nearby hospitals via Google Places, with actual distance.

### 2. Date & time-of-day awareness  ← (added 2026-06-29)
Environmental conditions are **not static** — they change by date and by hour.
Travel search must account for *when*, not just *where*.
- **Date selector** — let the user pick the date they'll be at the destination
  (e.g. arrival date, or a date during the trip). Metrics should reflect the
  forecast/seasonal value for that date, not just "today":
  - UV, pollen, air quality all vary seasonally and day-to-day.
  - Disease outbreak / season risk (e.g. flu season, monsoon) is date-driven.
  - Default the date from the linked trip's dates when available.
- **Time of day** — within a day, conditions swing significantly:
  - UV peaks around solar noon → show the daily peak + a "safe hours" window.
  - Air quality / pollen often worst at certain hours → surface hourly curve,
    not a single number.
  - Use the destination's **local time / timezone**, not the user's.
- UI implication: each metric can show a value *for the selected date/time*
  plus a short forecast curve, instead of one flat status.

### 3. Personalised to the user (CoreHealth's core thesis)
Cross-reference destination risks against the user's own health profile:
- "Pollen is High here **and you have a pollen allergy** → pack antihistamines."
- "Altitude risk **given your baseline resting HR**."
- Vaccination / medication recommendations driven by actual records, not a
  generic list.

### 4. Trip-aware intelligence
Tie into the existing trip-planning flow (`trip-planning/`):
- Pre-trip health briefing, packing / medication checklist.
- Alerts if outbreak status or conditions change before departure.

### 5. Action, not just info (design principle #1: data → decisions)
Each metric ends in a concrete action — book a travel-health appointment,
add a medication to the list, set a reminder.

## Suggested first slice
Real **Air Quality + UV + Pollen** with a **date selector** and local
time-of-day handling. Clean free APIs, instantly proves the location- and
time-aware concept.
