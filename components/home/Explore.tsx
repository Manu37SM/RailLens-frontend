import { Building2, Map, Train, Zap } from 'lucide-react';

import Section from './Section';
import DashboardGrid from './DashboardGrid';

import { DashboardItem } from '@/types/DashboardItem';

const items: DashboardItem[] = [
  {
    title: 'Vande Bharat',
    description: "Explore India's premium semi high-speed trains.",
    icon: Zap,
    accent: 'blue',
  },
  {
    title: 'Rajdhani Express',
    description: 'Browse flagship long-distance express services.',
    icon: Train,
    accent: 'blue',
  },
  {
    title: 'Major Stations',
    description: 'Discover important railway junctions.',
    icon: Building2,
    accent: 'blue',
  },
  {
    title: 'Popular Routes',
    description: 'Explore frequently travelled routes.',
    icon: Map,
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
