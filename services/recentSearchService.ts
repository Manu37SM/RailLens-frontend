import { RecentSearch } from '@/types/recentSearch';

const STORAGE_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 10;

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load recent searches:', error);
    return [];
  }
}

function saveRecentSearches(searches: RecentSearch[]) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

function addSearch(search: RecentSearch) {
  const searches = getRecentSearches();

  const filtered = searches.filter((item) => {
    switch (search.type) {
      case 'train':
        return !(
          item.type === 'train' && item.trainNumber === search.trainNumber
        );

      case 'station':
        return !(
          item.type === 'station' && item.stationCode === search.stationCode
        );

      case 'journey':
        return !(
          item.type === 'journey' &&
          item.fromCode === search.fromCode &&
          item.toCode === search.toCode
        );
    }
  });

  filtered.unshift(search);

  saveRecentSearches(filtered.slice(0, MAX_RECENT_SEARCHES));
}

export function addTrainSearch(trainNumber: string, trainName: string) {
  addSearch({
    type: 'train',
    trainNumber,
    trainName,
    timestamp: Date.now(),
  });
}

export function addStationSearch(stationCode: string, stationName: string) {
  addSearch({
    type: 'station',
    stationCode,
    stationName,
    timestamp: Date.now(),
  });
}

export function addJourneySearch(
  fromCode: string,
  fromName: string,
  toCode: string,
  toName: string
) {
  addSearch({
    type: 'journey',
    fromCode,
    fromName,
    toCode,
    toName,
    timestamp: Date.now(),
  });
}
