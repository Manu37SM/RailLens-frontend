import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import FavoritesList from '@/components/favorites/FavoritesList';
export const metadata: Metadata = {
  title: 'Favorites | RailLens',
  robots: { index: false, follow: true },
};
export default function FavoritesPage() {
  return (
    <Container>
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Favorites' }]}
      />

      <section className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Favorites
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Trains and stations you&apos;ve saved, stored on this device.
          </p>
        </div>

        <FavoritesList />
      </section>
    </Container>
  );
}
