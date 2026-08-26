export interface AdminStatsResponse {
  totalTrains: number;
  totalStations: number;
  totalScheduleRows: number;
}
export interface ImportResult {
  success: boolean;
  rowsImported: number;
  rowsFailed: number;
  message: string;
}
export interface DatasetHealthResponse {
  totalIssues: number;
  duplicateScheduleRowCount: number;
  duplicateScheduleRowSamples: string[];
  missingTimingCount: number;
  missingTimingSamples: string[];
  distanceInconsistencyCount: number;
  distanceInconsistencySamples: string[];
  impossibleSpeedCount: number;
  impossibleSpeedSamples: string[];
  haltAnomalyCount: number;
  haltAnomalySamples: string[];
  orphanStationCount: number;
  orphanStationSamples: string[];
  invalidRouteCount: number;
  invalidRouteSamples: string[];
}
