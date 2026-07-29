'use client';

import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

import Card from '@/components/layout/Card';
import { QuickAccessItem } from '@/types/quickAccess';

interface QuickAccessCardProps {
  title: string;
  description: string;

  icon: LucideIcon;

  items: QuickAccessItem[];

  emptyTitle: string;
  emptyDescription: string;

  emptyHref?: string;
  emptyHrefLabel?: string;
  layout?: 'list' | 'horizontal';
}

export default function QuickAccessCard({
  title,
  description,
  icon: HeaderIcon,

  items,

  emptyTitle,
  emptyDescription,

  emptyHref,
  emptyHrefLabel,
  layout = 'list',
}: QuickAccessCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>

          <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>
        </div>

        <HeaderIcon className="h-5 w-5 text-orange-500" />
      </div>

      {items.length === 0 ? (
        <div className="py-6 text-center">
          <HeaderIcon className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" />

          <p className="font-medium">{emptyTitle}</p>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{emptyDescription}</p>

          {emptyHref && emptyHrefLabel && (
            <Link
              href={emptyHref}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              {emptyHrefLabel}

              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            layout === 'horizontal'
              ? 'flex gap-4 overflow-x-auto pb-2'
              : 'space-y-3'
          }
        >
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 p-3 transition-[background-color,border-color] hover:border-orange-300 hover:bg-orange-50 ${
                  layout === 'horizontal' ? 'min-w-[280px] flex-shrink-0' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <Icon className="h-5 w-5 text-orange-600" />
                  </div>

                  <div>
                    <div className="font-medium">{item.title}</div>

                    <div className="text-sm text-gray-500 dark:text-slate-400">{item.subtitle}</div>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 dark:text-slate-500 transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
