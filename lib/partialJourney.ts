import { RouteStopResponse } from '@/types/train';

export interface PartialJourneySegment {
  distanceKm: number;
  durationMinutes: number | null;
}

function parseTimeToMinutes(time: string | null): number | null {
  if (!time) return null;

  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return hours * 60 + minutes;
}

/**
 * Distance/duration between any two stops on a train's route - not just
 * source-to-destination. M-Indicator and IndianRailInfo both offer this
 * ("select your boarding and de-boarding stations") since most passengers
 * don't ride a train end-to-end. Computed entirely client-side from data
 * the train details page already has (every stop's cumulative distance,
 * journeyDay and arrival/departure time) - no extra API call needed.
 *
 * Mirrors the day-rollover math in the backend's JourneyDayCalculator
 * (minutesBetween): converts each stop to "minutes since journeyDay 1
 * started" and takes the difference, so a segment that crosses midnight
 * (journeyDay increases) still comes out correct.
 */
export function computePartialJourney(
  boarding: RouteStopResponse,
  deboarding: RouteStopResponse
): PartialJourneySegment | null {
  // Always order by sequence, regardless of which stop was tapped first -
  // a passenger tapping stops out of route order still means "the segment
  // between these two," not "travel backwards."
  const [from, to] =
    boarding.sequenceNo <= deboarding.sequenceNo
      ? [boarding, deboarding]
      : [deboarding, boarding];

  if (from.sequenceNo === to.sequenceNo) return null;

  const distanceKm =
    from.distance != null && to.distance != null
      ? to.distance - from.distance
      : 0;

  // Boarding uses departureTime (when you'd actually leave that stop);
  // de-boarding uses arrivalTime - same convention TrainHeader/backend use
  // for the full journey, just applied to an arbitrary sub-segment here.
  const departureMinutes = parseTimeToMinutes(from.departureTime ?? from.arrivalTime);
  const arrivalMinutes = parseTimeToMinutes(to.arrivalTime ?? to.departureTime);

  let durationMinutes: number | null = null;

  if (departureMinutes != null && arrivalMinutes != null) {
    durationMinutes =
      (to.journeyDay - from.journeyDay) * 24 * 60 + (arrivalMinutes - departureMinutes);

    if (durationMinutes < 0) durationMinutes = null;
  }

  return { distanceKm, durationMinutes };
}

export function formatPartialDuration(minutes: number | null): string {
  if (minutes == null) return '--';

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}
