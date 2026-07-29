import { Metadata } from 'next';

// AssistantPage is a 'use client' component (it needs useRouter), and
// Next.js only reads a route's `metadata` export from a Server Component -
// this layout exists solely to provide that. Marked noindex: the full-page
// assistant is just an alternate entry point to the same chat widget
// available everywhere via AssistantFab, so it has no unique content worth
// surfacing in search results, and indexing it would just create a
// near-duplicate of the home page in search engines' eyes.
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
