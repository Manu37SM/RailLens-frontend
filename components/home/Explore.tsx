import { BarChart3, Building2, Map, Train } from 'lucide-react';

import Section from './Section';
import DashboardGrid from './DashboardGrid';

import { DashboardItem } from '@/types/DashboardItem';

// Previously these tiles ("Vande Bharat", "Rajdhani Express", etc.) had no
// href, so DashboardGrid rendered them as non-interactive <div>s that
// still looked clickable (cursor-pointer, hover shadow via Card) - a dead
// end that misled anyone who tapped one. Train category/type isn't in the
// imported dataset (see rail-dataset-analyzer's column_detector.py - no
// CLASSES_COLUMNS equivalent survives into what's actually stored), so
// filtering by "Vande Bharat" etc. genuinely isn't possible yet without a
// richer data source. Replaced with tiles that link to real, working
// pages instead of implying a filter that doesn't exist.
const items: DashboardItem[] = [
  {
    title: 'Browse All Trains',
    description: 'Search the full list of trains by number or name.',
    icon: Train,
    href: '/trains',
  },
  {
    title: 'Major Stations',
    description: 'Search stations and see every train that stops there.',
    icon: Building2,
    href: '/stations',
  },
  {
    title: 'Plan a Journey',
    description: 'Find trains running between any two stations.',
    icon: Map,
    href: '/journeys',
  },
  {
    title: 'Statistics',
    description: 'Longest/shortest routes, busiest station and more.',
    icon: BarChart3,
    href: '/stats',
    accent: 'blue',
  },
];

export default function Explore() {
  return (
    <Section
      title="Explore"
      description="Discover popular railway services and destinations."
    >
      <DashboardGrid items={items} columns="2" />
    </Section>
  );
}
