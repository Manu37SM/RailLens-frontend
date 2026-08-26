'use client';
import {
  CircleHelp,
  History,
  Home,
  MapPin,
  Route,
  Star,
  Train,
} from 'lucide-react';
import ActionChips, { type ActionChip } from './ActionChips';
export type QuickAction =
  | 'home'
  | 'trains'
  | 'stations'
  | 'journeys'
  | 'train'
  | 'station'
  | 'journey'
  | 'favorites'
  | 'recent'
  | 'help';
interface QuickActionProps {
  onAction: (action: QuickAction) => void;
}
const actions: ActionChip[] = [
  {
    icon: Home,
    label: 'Home',
    action: 'home',
  },
  {
    icon: Train,
    label: 'Trains',
    action: 'trains',
  },
  {
    icon: MapPin,
    label: 'Stations',
    action: 'stations',
  },
  {
    icon: Route,
    label: 'Journey Search',
    action: 'journeys',
  },
  {
    icon: Train,
    label: 'Find Train',
    action: 'train',
  },
  {
    icon: MapPin,
    label: 'Search Station',
    action: 'station',
  },
  {
    icon: Route,
    label: 'Plan Journey',
    action: 'journey',
  },
  {
    icon: Star,
    label: 'Favorites',
    action: 'favorites',
  },
  {
    icon: History,
    label: 'Recent Searches',
    action: 'recent',
  },
  {
    icon: CircleHelp,
    label: 'Help',
    action: 'help',
  },
];
export default function QuickActions({ onAction }: QuickActionProps) {
  return (
    <ActionChips title="Quick Actions" actions={actions} onAction={onAction} />
  );
}
