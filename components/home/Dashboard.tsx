import Container from '@/components/layout/Container';

import QuickAccess from './QuickAccess';
import SearchActions from './SearchActions';
import Explore from './Explore';
import TravelTools from './TravelTools';

export default function Dashboard() {
  return (
    <section className="py-10">
      <Container>
        <div className="space-y-12">
          <QuickAccess />

          <SearchActions />

          <Explore />

          <TravelTools />
        </div>
      </Container>
    </section>
  );
}
