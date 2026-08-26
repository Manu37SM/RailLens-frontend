import { MapPinned, Route, TrainFront } from 'lucide-react';
import Section from './Section';
import DashboardGrid from './DashboardGrid';
import { DashboardItem } from '@/types/DashboardItem';
const items: DashboardItem[] = [
  {
    title: 'Train Search',
    description: 'Find trains by name or train number.',
    href: '/trains',
    icon: TrainFront,
  },
  {
    title: 'Journey Search',
    description: 'Search trains between two stations.',
    href: '/journeys',
    icon: Route,
  },
  {
    title: 'Station Search',
    description: 'Explore stations and departures.',
    href: '/stations',
    icon: MapPinned,
  },
];
export default function SearchActions() {
  return (
    <Section title="Search" description="Choose a railway search service.">
      <DashboardGrid items={items} />
    </Section>
  );
}
