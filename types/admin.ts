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
