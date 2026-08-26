import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SavedJourneysList from '@/components/saved-journeys/SavedJourneysList';
export const metadata: Metadata = {
  title: 'Saved Journeys | RailLens',
  robots: { index: false, follow: true },
};
export default function SavedJourneysPage() {
  return (
    <Container>
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Saved Journeys' }]}
      />

      <section className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Saved Journeys
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Boarding/de-boarding segments you&apos;ve saved, stored on this
            device.
          </p>
        </div>

        <SavedJourneysList />
      </section>
    </Container>
  );
}
