import Container from '@/components/layout/Container';

import QuickAccess from './QuickAccess';
import SearchActions from './SearchActions';
import Explore from './Explore';
import RailwayInsights from './RailwayInsights';
import Popular from './Popular';
import Section from './Section';

export default function Dashboard() {
  return (
    <section className="py-10">
      <Container>
        <div className="space-y-10">
          <QuickAccess />

          <SearchActions />

          <Explore />

          <Section title="Popular" description="What you've been looking at on this device.">
            <Popular />
          </Section>

          <RailwayInsights />
        </div>
      </Container>
    </section>
  );
}
