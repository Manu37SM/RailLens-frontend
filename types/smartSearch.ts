import { TrainSearchResponse } from './train';
export interface SmartSearchResponse {
  recognized: boolean;
  interpretedAs: string | null;
  matchCount: number;
  trains: TrainSearchResponse[];
}
