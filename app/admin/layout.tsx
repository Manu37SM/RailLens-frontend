import { Metadata } from 'next';

// AdminDashboard is a 'use client' component (it needs local state for the
// key form/stats/import flow), so metadata has to come from this Server
// Component wrapper instead - see the same pattern in app/assistant/layout.tsx.
export const metadata: Metadata = {
  title: 'Admin | RailLens',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
