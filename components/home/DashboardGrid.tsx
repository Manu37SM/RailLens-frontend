import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Card from '@/components/layout/Card';

import { DashboardItem } from '@/types/DashboardItem';

interface DashboardGridProps {
  items: DashboardItem[];
  columns?: '2' | '3';
}

export default function DashboardGrid({
  items,
  columns = '3',
}: DashboardGridProps) {
  const accentClasses = {
    orange: {
      icon: 'bg-orange-100 text-orange-600',
      badge: 'bg-orange-100 text-orange-700',
    },
    blue: {
      icon: 'bg-blue-100 text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    green: {
      icon: 'bg-green-100 text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
    gray: {
      icon: 'bg-gray-100 text-gray-600',
      badge: 'bg-gray-100 text-gray-700',
    },
  };

  return (
    <div
      className={
        columns === '2'
          ? 'grid gap-5 md:grid-cols-2'
          : 'grid gap-5 md:grid-cols-2 lg:grid-cols-3'
      }
    >
      {items.map((item) => {
        const Icon = item.icon;
        const colors = accentClasses[item.accent ?? 'orange'];

        const content = (
          <Card
            className={`h-full transition-all ${
              item.disabled
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg'
            }`}
          >
            <div className="flex h-full flex-col">
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${colors.icon}`}
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="font-semibold">{item.title}</h3>

              <p className="mt-2 flex-1 text-sm text-gray-500">
                {item.description}
              </p>

              {item.badge && (
                <span
                  className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${colors.badge}`}
                >
                  {' '}
                  {item.badge}
                </span>
              )}

              {!item.disabled && item.href && (
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-orange-600">
                  Explore
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          </Card>
        );

        if (item.disabled || !item.href) {
          return <div key={item.title}>{content}</div>;
        }

        return (
          <Link key={item.title} href={item.href}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
