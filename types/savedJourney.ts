export interface SavedJourney {
  id: string;

  trainNumber: string;
  trainName: string;

  boardingStationCode: string;
  boardingStationName: string;
  deboardingStationCode: string;
  deboardingStationName: string;

  distanceKm: number;
  durationMinutes: number | null;

  savedAt: string;
}
