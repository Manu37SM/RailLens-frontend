export interface PopularEntry {
  code: string;
  name: string;
  views: number;
}

export interface PopularityState {
  trains: Record<string, PopularEntry>;
  stations: Record<string, PopularEntry>;
}
