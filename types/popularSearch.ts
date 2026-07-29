export interface PopularSearchEntry {
  // Normalized (trimmed, lowercased) query text - used as both the
  // dedup key and the display label's lowercase form (see
  // stores/popularSearchStore.ts for how display casing is preserved).
  query: string;
  displayQuery: string;
  count: number;
}

export interface PopularSearchState {
  trains: Record<string, PopularSearchEntry>;
  stations: Record<string, PopularSearchEntry>;
}
