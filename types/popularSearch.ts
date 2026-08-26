export interface PopularSearchEntry {
  query: string;
  displayQuery: string;
  count: number;
}
export interface PopularSearchState {
  trains: Record<string, PopularSearchEntry>;
  stations: Record<string, PopularSearchEntry>;
}
