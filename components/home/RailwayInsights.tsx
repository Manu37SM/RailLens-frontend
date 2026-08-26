import { Brain, Network, Search, Sparkles, Trophy } from 'lucide-react';
import Section from './Section';
import DashboardGrid from './DashboardGrid';
import { DashboardItem } from '@/types/DashboardItem';
const items: DashboardItem[] = [
  {
    title: 'Railway Network',
    description:
      'Explore the station network as a graph - connectivity, density, and the most central stations.',
    icon: Network,
    href: '/network',
    accent: 'blue',
  },
  {
    title: 'Train Intelligence',
    description:
      'Route complexity, uniqueness, and efficiency scores for any train - open a train’s page to see it.',
    icon: Brain,
    href: '/trains',
    accent: 'orange',
  },
  {
    title: 'Rankings',
    description:
      'Leaderboards for halts, halt durations, and the most popular and connected stations.',
    icon: Trophy,
    href: '/rankings',
    accent: 'green',
  },
  {
    title: 'Fun Facts',
    description:
      'Station name trivia, palindrome codes, and alphabet coverage.',
    icon: Sparkles,
    href: '/fun-facts',
    accent: 'blue',
  },
  {
    title: 'Smart Search',
    description:
      'Query trains in plain English, like "trains that stop at both X and Y".',
    icon: Search,
    href: '/smart-search',
    accent: 'orange',
  },
];
export default function RailwayInsights() {
  return (
    <Section
      title="Railway Insights"
      description="Analytics computed entirely from the dataset - no external or live APIs."
    >
      <DashboardGrid items={items} columns="3" />
    </Section>
  );
}
