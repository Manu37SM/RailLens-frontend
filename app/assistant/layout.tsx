import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Assistant | RailLens',
  robots: { index: false, follow: true },
};
export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
