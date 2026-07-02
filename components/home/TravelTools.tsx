import {
  Clock3,
  MapPinned,
  Ticket,
  TrainTrack,
  Users,
  Wifi,
} from 'lucide-react';

import Section from './Section';
import DashboardGrid from './DashboardGrid';

import { DashboardItem } from '@/types/DashboardItem';

const items: DashboardItem[] = [
  {
    title: 'Live Running Status',
    description: 'Track trains in real time.',
    icon: TrainTrack,
    badge: 'Coming Soon',
    disabled: true,
    accent: 'gray',
  },
  {
    title: 'PNR Status',
    description: 'Check booking confirmation status.',
    icon: Ticket,
    badge: 'Coming Soon',
    disabled: true,
    accent: 'gray',
  },
  {
    title: 'Seat Availability',
    description: 'Find available seats before booking.',
    icon: Users,
    badge: 'Coming Soon',
    disabled: true,
    accent: 'gray',
  },
  {
    title: 'Coach Position',
    description: 'Locate your coach before arrival.',
    icon: MapPinned,
    badge: 'Coming Soon',
    disabled: true,
    accent: 'gray',
  },
  {
    title: 'Platform Information',
    description: 'Know the expected platform.',
    icon: Wifi,
    badge: 'Coming Soon',
    disabled: true,
    accent: 'gray',
  },
  {
    title: 'Delay Information',
    description: 'View expected delays and updates.',
    icon: Clock3,
    badge: 'Coming Soon',
    disabled: true,
    accent: 'gray',
  },
];

export default function TravelTools() {
  return (
    <Section
      title="Travel Tools"
      description="More railway services are coming soon."
    >
      <DashboardGrid items={items} />
    </Section>
  );
}
