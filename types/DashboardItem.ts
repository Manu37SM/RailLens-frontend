import { LucideIcon } from 'lucide-react';

export interface DashboardItem {
  title: string;
  description: string;

  icon: LucideIcon;

  href?: string;

  disabled?: boolean;

  badge?: string;

  accent?: 'orange' | 'blue' | 'green' | 'gray';
}
