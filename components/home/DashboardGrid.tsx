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
      icon: 'bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
      badge:
        'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300',
    },
    blue: {
      icon: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
    },
    green: {
      icon: 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400',
      badge:
        'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300',
    },
    gray: {
      icon: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300',
      badge: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
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
            className={`h-full transition-shadow ${
              item.disabled
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:border-orange-300 hover:shadow-md'
            }`}
          >
            <div className="flex h-full flex-col">
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="font-semibold">{item.title}</h3>

              <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-slate-400">
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
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-600">
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
