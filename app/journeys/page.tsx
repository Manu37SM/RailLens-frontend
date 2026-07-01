import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import JourneySearchClient from '@/components/journey/JourneySearchClient';

export default function JourneysPage() {
  return (
    <Container>
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Between Stations' }]}
      />

      <JourneySearchClient />
    </Container>
  );
}
