import { Metadata } from 'next';
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
