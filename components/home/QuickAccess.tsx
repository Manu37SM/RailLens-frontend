import Section from './Section';

import Favorites from './Favorites';
import RecentSearches from './RecentSearches';

export default function QuickAccess() {
  return (
    <Section
      title="Quick Access"
      description="Your saved items and recent activity."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Favorites />
        <RecentSearches />
      </div>
    </Section>
  );
}
